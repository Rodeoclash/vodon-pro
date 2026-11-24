import fs from 'node:fs';
import path from 'node:path';
import {
  _electron,
  type ElectronApplication,
  expect,
  type Page,
} from '@playwright/test';

export const ROOT = path.resolve(__dirname, '..');
export const VIDEO_DIR = path.join(ROOT, 'e2e', '.videos');
export const VIDEOS = {
  one: path.join(VIDEO_DIR, 'player1.mp4'),
  two: path.join(VIDEO_DIR, 'player2.mp4'),
};
export const FFMPEG = path.join(
  ROOT,
  'node_modules',
  'ffmpeg-ffprobe-static',
  process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg',
);

/** The Electron binary from node_modules, or a packaged app. */
export function executable(): string {
  if (process.env.E2E_EXECUTABLE) return process.env.E2E_EXECUTABLE;

  const electronDir = path.join(ROOT, 'node_modules', 'electron');
  const binary = fs.readFileSync(path.join(electronDir, 'path.txt'), 'utf8');
  return path.join(electronDir, 'dist', binary);
}

/** Arguments that start the app with its own profile and the given videos. */
export function appArgs(userDataDir: string, videos: string[] = []): string[] {
  return [
    // Chromium's OS sandbox needs setuid/userns support CI runners lack.
    '--no-sandbox',
    `--user-data-dir=${userDataDir}`,
    ...(process.env.E2E_EXECUTABLE ? [] : [ROOT]),
    ...videos,
  ];
}

export type RunningApp = {
  app: ElectronApplication;
  page: Page;
  /** Uncaught exceptions and console errors from the renderer */
  errors: string[];
};

export async function launchApp(
  userDataDir: string,
  videos: string[] = [],
): Promise<RunningApp> {
  const app = await _electron.launch({
    executablePath: executable(),
    args: appArgs(userDataDir, videos),
  });
  const page = await app.firstWindow();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.waitForLoadState('domcontentloaded');
  return { app, page, errors };
}

export type StoredVideo = {
  id: string;
  name: string;
  filePath: string;
  duration: number | null;
  frameRate: number;
  syncTime: number;
  durationNormalised: number | null;
  bookmarks: Array<{ drawing: unknown }>;
};

export type StoredState = {
  activeVideoId: string | null;
  videos: StoredVideo[];
};

/** The video store as autosaved to localStorage (superjson). */
export function storedState(page: Page): Promise<StoredState | null> {
  return page.evaluate(() => {
    const raw = localStorage.getItem('vodon-store-videos-v2');
    return raw ? JSON.parse(raw).json.state : null;
  });
}

export function videoCount(page: Page): Promise<number> {
  return page.locator('video').count();
}

/**
 * Wait until the setup page has loaded `count` videos and worked out their
 * timeline. Known bug: leaving the setup page before that leaves later
 * videos out of the review page until something recalculates the offsets.
 */
export async function waitForAlignedVideos(
  page: Page,
  count: number,
): Promise<void> {
  await expect.poll(() => videoCount(page)).toBe(count);
  await expect
    .poll(async () =>
      (await storedState(page))?.videos.every(
        (video) => video.durationNormalised !== null,
      ),
    )
    .toBe(true);
}

/** Close the help dialog shown on the first visit to a page, if it's open. */
export async function dismissHelp(page: Page): Promise<void> {
  const help = page.getByRole('dialog', { name: 'Help' });
  if (await help.isVisible()) {
    await help.getByRole('button', { name: 'Close' }).first().click();
    await help.waitFor({ state: 'hidden' });
  }
}

export async function goTo(page: Page, hash: string): Promise<void> {
  await page.evaluate((h) => {
    window.location.hash = h;
  }, hash);
  await page.waitForTimeout(1000);
  await dismissHelp(page);
}
