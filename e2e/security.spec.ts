import { expect, test } from '@playwright/test';
import { launchApp, type RunningApp } from './app';

let running: RunningApp;

test.beforeEach(async () => {
  running = await launchApp(test.info().outputPath('profile'));
  // Record what would be handed to the OS instead of opening it
  await running.app.evaluate(({ shell }) => {
    const opened: string[] = [];
    Object.assign(globalThis, { opened });
    shell.openExternal = async (url: string) => {
      opened.push(url);
    };
  });
});

/** Chromium refusing a file: URL outright, before our handlers see it */
const withoutLocalResourceRefusals = (errors: string[]) =>
  errors.filter(
    (error) => !error.startsWith('Not allowed to load local resource'),
  );

test.afterEach(async () => {
  expect(running.errors).toEqual([]);
  await running.app.close();
});

const opened = () =>
  running.app.evaluate(
    () => (globalThis as unknown as { opened: string[] }).opened,
  );

test('only web and mail links are opened outside the app', async () => {
  const { page } = running;
  await page.evaluate(() => {
    window.open('https://example.com/new-window');
    window.open('file:///etc/passwd');
    window.open('smb://attacker/share');
    window.app.openBrowser('https://example.com/ipc');
    window.app.openBrowser('file:///C:/Windows/System32/calc.exe');
  });

  await expect
    .poll(opened)
    .toEqual(['https://example.com/new-window', 'https://example.com/ipc']);
  running.errors = withoutLocalResourceRefusals(running.errors);
});

test('the window cannot be navigated away from the app', async () => {
  const { app, page } = running;
  const appUrl = page.url();

  await page.evaluate(() => {
    window.location.href = 'https://example.com/navigate';
  });
  await expect.poll(opened).toEqual(['https://example.com/navigate']);

  await page.evaluate(() => {
    window.location.href = 'file:///etc/hosts';
  });
  await page.waitForTimeout(1000);

  expect(await opened()).toEqual(['https://example.com/navigate']);
  expect(
    await app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows().map((window) =>
        window.webContents.getURL(),
      ),
    ),
  ).toEqual([appUrl]);
  running.errors = withoutLocalResourceRefusals(running.errors);
});

test('the renderer cannot save a project without the save dialog', async () => {
  const { page } = running;
  const result = await page.evaluate(() =>
    window.app.saveProject('{}').then(
      () => 'saved',
      (error: Error) => error.message,
    ),
  );
  expect(result).toContain('No project save was requested');
});

test('the app runs from app://vodon/ under a strict CSP', async () => {
  const { app, page } = running;
  expect(page.url()).toMatch(/^app:\/\/vodon\/index\.html/);

  const csp = await app.evaluate(async ({ net }) => {
    const response = await net.fetch('app://vodon/index.html');
    return response.headers.get('Content-Security-Policy');
  });
  expect(csp).toContain("script-src 'self'");
  expect(csp).not.toContain("'unsafe-eval'");

  // An injected inline script doesn't run
  const ran = await page.evaluate(async () => {
    const script = document.createElement('script');
    script.textContent = 'window.injectedRan = true';
    document.body.appendChild(script);
    await new Promise((resolve) => setTimeout(resolve, 100));
    return (window as unknown as { injectedRan?: boolean }).injectedRan;
  });
  expect(ran).toBeUndefined();
  running.errors = running.errors.filter(
    (error) => !error.includes('Content Security Policy'),
  );
});

test('app:// only serves the built renderer', async () => {
  const status = (url: string) =>
    running.app.evaluate(
      async ({ net }, target) => (await net.fetch(target)).status,
      url,
    );

  expect(await status('app://vodon/index.html')).toBe(200);
  for (const url of [
    'app://vodon/../main/main.js',
    'app://vodon/%2e%2e/main/main.js',
    'app://vodon/..%2fpreload%2fpreload.js',
    'app://vodon/..%5cpreload%5cpreload.js',
    'app://other/index.html',
    'app://vodon/missing.js',
  ]) {
    expect({ url, status: await status(url) }).toEqual({ url, status: 404 });
  }
});

test('the renderer is sandboxed with no Node.js', async () => {
  const { app, page } = running;
  expect(
    await app.evaluate(({ BrowserWindow }) => {
      // Not in Electron's typings, but part of its API
      const contents = BrowserWindow.getAllWindows()[0]
        .webContents as unknown as {
        getLastWebPreferences: () => Electron.WebPreferences | null;
      };
      const prefs = contents.getLastWebPreferences();
      return {
        sandbox: prefs?.sandbox,
        contextIsolation: prefs?.contextIsolation,
        nodeIntegration: prefs?.nodeIntegration,
        webSecurity: prefs?.webSecurity,
      };
    }),
  ).toEqual({
    sandbox: true,
    contextIsolation: true,
    nodeIntegration: false,
    webSecurity: true,
  });

  expect(
    await page.evaluate(() => ({
      require: typeof (window as unknown as { require?: unknown }).require,
      process: typeof (window as unknown as { process?: unknown }).process,
      // The bridge only exposes plain functions
      app: Object.keys(window.app).every(
        (key) =>
          typeof window.app[key as keyof typeof window.app] === 'function',
      ),
    })),
  ).toEqual({ require: 'undefined', process: 'undefined', app: true });
});

test('the page only gets the permissions it uses', async () => {
  const { page } = running;
  expect(
    await page.evaluate(async () => ({
      notifications: await Notification.requestPermission(),
      // Asks the permission check handler (no device needed)
      camera: (
        await navigator.permissions.query({ name: 'camera' as PermissionName })
      ).state,
      geolocation: (await navigator.permissions.query({ name: 'geolocation' }))
        .state,
      fullscreen: await document.documentElement.requestFullscreen().then(
        () => 'granted',
        (error: Error) => error.name,
      ),
    })),
  ).toEqual({
    notifications: 'denied',
    camera: 'denied',
    geolocation: 'denied',
    fullscreen: 'granted',
  });
});
