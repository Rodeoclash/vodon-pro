/**
 * Smoke test for the packaged, fused app (`npm run package` first).
 *
 * Playwright can't drive it: the fuses turn off --inspect. Chromium's
 * --remote-debugging-port isn't a fuse, so this launches the packaged binary
 * with it and drives the page over the DevTools protocol. It checks what the
 * e2e suite (which runs the unpackaged build) can't:
 *
 * - the fuses in package.json are flipped in the binary
 * - the bundled ffmpeg runs from app.asar.unpacked (it makes the test video)
 * - the app loads its page from app://vodon/, sandboxed
 * - a video passed on the command line plays over vodon-media://
 * - ffprobe metadata comes back through IPC
 *
 * Usage: node e2e/smoke.mts [path to packaged executable]
 * On Linux without a display, wrap in `xvfb-run -a`.
 */
import { type ChildProcess, execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { FuseState, FuseV1Options, getCurrentFuseWire } from '@electron/fuses';

const ROOT = path.resolve(import.meta.dirname, '..');
const BUILD = path.join(ROOT, 'release', 'build');
const pkg = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'),
);
const productName: string = pkg.build.productName;

type Packaged = {
  /** What to launch */
  executable: string;
  /** What @electron/fuses reads: the .app on macOS, else the executable */
  fuseTarget: string;
  /** The app's resources dir, holding app.asar and app.asar.unpacked */
  resources: string;
};

function packaged(): Packaged {
  const given = process.argv[2];
  if (process.platform === 'darwin') {
    const app =
      given?.replace(/(\.app)\/.*$/, '$1') ??
      path.join(
        BUILD,
        process.arch === 'arm64' ? 'mac-arm64' : 'mac',
        `${productName}.app`,
      );
    return {
      executable: path.join(app, 'Contents', 'MacOS', productName),
      fuseTarget: app,
      resources: path.join(app, 'Contents', 'Resources'),
    };
  }
  const executable =
    given ??
    (process.platform === 'win32'
      ? path.join(BUILD, 'win-unpacked', `${productName}.exe`)
      : path.join(BUILD, 'linux-unpacked', pkg.name));
  return {
    executable,
    fuseTarget: executable,
    resources: path.join(path.dirname(executable), 'resources'),
  };
}

function log(message: string) {
  console.log(`smoke: ${message}`);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Poll until `check` returns a truthy value, or fail with `what`. */
async function waitFor<T>(
  what: string,
  check: () => Promise<T> | T,
  timeoutMs = 30_000,
): Promise<NonNullable<T>> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const value = await check();
      if (value) return value as NonNullable<T>;
    } catch (error) {
      lastError = error;
    }
    await sleep(250);
  }
  throw new Error(
    `Timed out waiting for ${what}${lastError ? `: ${lastError}` : ''}`,
  );
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

/** Every fuse set in package.json's electronFuses is set in the binary. */
async function checkFuses(target: string) {
  const wire = await getCurrentFuseWire(target);
  const configured = Object.entries(
    pkg.build.electronFuses as Record<string, boolean>,
  ).filter(([key]) => key !== 'resetAdHocDarwinSignature');
  assert(configured.length > 0, 'No electronFuses in package.json');

  for (const [key, enabled] of configured) {
    const name = key[0].toUpperCase() + key.slice(1);
    const index = FuseV1Options[name as keyof typeof FuseV1Options];
    assert(index !== undefined, `Unknown fuse ${key}`);
    const expected = enabled ? FuseState.ENABLE : FuseState.DISABLE;
    assert(
      wire[index] === expected,
      `Fuse ${name} is ${FuseState[wire[index] as FuseState]}, expected ${FuseState[expected]}`,
    );
  }
  log(`fuses match package.json (${configured.length} checked)`);
}

/** An 8s test video, made by the ffmpeg shipped in app.asar.unpacked. */
function makeVideo(resources: string, dir: string): string {
  const ffmpeg = path.join(
    resources,
    'app.asar.unpacked',
    'node_modules',
    'ffmpeg-ffprobe-static',
    process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg',
  );
  assert(fs.existsSync(ffmpeg), `No unpacked ffmpeg at ${ffmpeg}`);
  const video = path.join(dir, 'smoke.mp4');
  execFileSync(ffmpeg, [
    '-loglevel',
    'error',
    '-f',
    'lavfi',
    '-i',
    'testsrc2=size=640x360:rate=30:duration=8',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    video,
  ]);
  log('the packaged ffmpeg made a test video');
  return video;
}

/** A minimal DevTools protocol client over one target's WebSocket. */
class Cdp {
  private nextId = 1;
  private pending = new Map<
    number,
    { resolve: (v: unknown) => void; reject: (e: Error) => void }
  >();
  readonly errors: string[] = [];

  private readonly socket: WebSocket;

  private constructor(socket: WebSocket) {
    this.socket = socket;
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const call = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) call?.reject(new Error(message.error.message));
        else call?.resolve(message.result);
      } else if (message.method === 'Runtime.exceptionThrown') {
        this.errors.push(message.params.exceptionDetails.text);
      } else if (
        message.method === 'Runtime.consoleAPICalled' &&
        message.params.type === 'error'
      ) {
        this.errors.push(
          message.params.args
            .map((arg: { value?: unknown; description?: string }) =>
              String(arg.value ?? arg.description),
            )
            .join(' '),
        );
      }
    });
  }

  static async connect(url: string): Promise<Cdp> {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });
    return new Cdp(socket);
  }

  send<T = unknown>(method: string, params: object = {}): Promise<T> {
    const id = this.nextId++;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, {
        resolve: resolve as (v: unknown) => void,
        reject,
      });
    });
  }

  /** Evaluate an expression in the page and return its (awaited) value. */
  async evaluate<T>(expression: string): Promise<T> {
    const result = await this.send<{
      result: { value: T };
      exceptionDetails?: { text: string; exception?: { description?: string } };
    }>('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      const { text, exception } = result.exceptionDetails;
      throw new Error(exception?.description ?? text);
    }
    return result.result.value;
  }

  close() {
    this.socket.close();
  }
}

type Target = { type: string; url: string; webSocketDebuggerUrl: string };

async function run() {
  const app = packaged();
  assert(fs.existsSync(app.executable), `No packaged app at ${app.executable}`);
  log(`testing ${app.executable}`);

  await checkFuses(app.fuseTarget);

  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'vodon-smoke-'));
  const userDataDir = path.join(temp, 'profile');
  const video = makeVideo(app.resources, temp);

  let child: ChildProcess | undefined;
  let cdp: Cdp | undefined;
  try {
    child = spawn(
      app.executable,
      [
        // Chromium's OS sandbox needs setuid/userns support CI runners lack
        ...(process.platform === 'linux' ? ['--no-sandbox'] : []),
        `--user-data-dir=${userDataDir}`,
        // Port 0: Chromium picks one and writes it to DevToolsActivePort
        '--remote-debugging-port=0',
        video,
      ],
      { stdio: ['ignore', 'inherit', 'inherit'] },
    );
    const launched = child;

    const portFile = path.join(userDataDir, 'DevToolsActivePort');
    const port = await waitFor('the DevTools port', () => {
      if (launched.exitCode !== null) {
        throw new Error(`the app exited with ${launched.exitCode}`);
      }
      return fs.existsSync(portFile)
        ? fs.readFileSync(portFile, 'utf8').split('\n')[0].trim()
        : '';
    });

    const page = await waitFor('the app page', async () => {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets: Target[] = await response.json();
      return targets.find(
        (t) => t.type === 'page' && t.url.startsWith('app://vodon/'),
      );
    });
    log(`page loaded from ${page.url}`);

    const session = await Cdp.connect(page.webSocketDebuggerUrl);
    cdp = session;
    await session.send('Runtime.enable');

    const isolation = await session.evaluate<string>(
      '[typeof require, typeof process, typeof window.app, typeof window.video].join()',
    );
    assert(
      isolation === 'undefined,undefined,object,object',
      `Renderer isolation broken: require, process, app, video are ${isolation}`,
    );
    const version = await session.evaluate<string>('window.app.getVersion()');
    assert(
      version === pkg.version,
      `App reports ${version}, expected ${pkg.version}`,
    );
    log(`renderer is isolated, preload bridge answers (v${version})`);

    // ffprobe from app.asar.unpacked, through IPC
    const duration = await session.evaluate<number | null>(
      `window.video.getMetadata(${JSON.stringify(video)}).then((m) => m?.format?.duration ?? null)`,
    );
    assert(
      duration !== null && Math.abs(duration - 8) < 0.5,
      `ffprobe gave duration ${duration}, expected about 8s`,
    );
    log(`ffprobe read the video's metadata (${duration}s)`);

    const src = await waitFor('the video element to load', () =>
      session.evaluate<string | null>(
        `(() => {
          const el = document.querySelector('video');
          return el && el.readyState >= 2 && !el.error ? el.currentSrc : null;
        })()`,
      ),
    );
    assert(
      src.startsWith('vodon-media://video/'),
      `Video source is ${src}, expected a vodon-media URL`,
    );

    await session.evaluate(
      `(() => {
        const el = document.querySelector('video');
        el.muted = true;
        return el.play().then(() => true);
      })()`,
    );
    await waitFor('the video to play', () =>
      session.evaluate<boolean>(
        `document.querySelector('video').currentTime > 0.5`,
      ),
    );
    log('the video plays over vodon-media://');

    assert(
      session.errors.length === 0,
      `Renderer errors:\n${session.errors.join('\n')}`,
    );
    log('passed');
  } finally {
    cdp?.close();
    if (child && child.exitCode === null) {
      child.kill();
      await new Promise((resolve) => {
        child?.once('exit', resolve);
        setTimeout(resolve, 5000);
      });
    }
    fs.rmSync(temp, { recursive: true, force: true, maxRetries: 5 });
  }
}

run().catch((error) => {
  console.error(
    `smoke: FAILED: ${error instanceof Error ? error.message : error}`,
  );
  process.exit(1);
});
