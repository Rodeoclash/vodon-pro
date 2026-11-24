import { expect, test } from '@playwright/test';
import {
  dismissHelp,
  goTo,
  launchApp,
  type RunningApp,
  storedState,
  VIDEOS,
  videoCount,
} from './app';

let running: RunningApp;

test.afterEach(async () => {
  expect(running.errors).toEqual([]);
  await running.app.close();
});

test('loads videos passed on the command line, with ffprobe metadata', async () => {
  const testInfo = test.info();
  running = await launchApp(testInfo.outputPath('profile'), [
    VIDEOS.one,
    VIDEOS.two,
  ]);
  const { page } = running;

  await expect.poll(() => videoCount(page)).toBe(2);
  await expect
    .poll(async () =>
      (await storedState(page))?.videos.map((video) => ({
        filePath: video.filePath,
        duration: video.duration,
        frameRate: video.frameRate,
      })),
    )
    .toEqual([
      { filePath: VIDEOS.one, duration: 8, frameRate: 30 },
      { filePath: VIDEOS.two, duration: 8, frameRate: 30 },
    ]);
});

test('the aligner plays, pauses and sets the sync time', async () => {
  const testInfo = test.info();
  running = await launchApp(testInfo.outputPath('profile'), [
    VIDEOS.one,
    VIDEOS.two,
  ]);
  const { page } = running;
  await expect.poll(() => videoCount(page)).toBe(2);
  await dismissHelp(page);

  const first = () =>
    page.evaluate(() => {
      const el = document.querySelectorAll('video')[0];
      return { time: el.currentTime, paused: el.paused };
    });

  await page.locator('button[aria-label="Play"]').first().click();
  await expect.poll(async () => (await first()).time).toBeGreaterThan(1);
  await page.locator('button[aria-label="Pause"]').first().click();
  await expect.poll(async () => (await first()).paused).toBe(true);
  const pausedAt = (await first()).time;
  await page.waitForTimeout(500);
  expect((await first()).time).toBe(pausedAt);

  // Seeking an aligner stores that video's sync time
  await page.evaluate(() => {
    document.querySelectorAll('video')[1].currentTime = 3;
  });
  await expect
    .poll(async () => (await storedState(page))?.videos[1].syncTime)
    .toBeCloseTo(3, 1);
});

test('dropping a file on the setup page adds it', async () => {
  const testInfo = test.info();
  running = await launchApp(testInfo.outputPath('profile'), [VIDEOS.one]);
  const { page } = running;
  await expect.poll(() => videoCount(page)).toBe(1);
  await dismissHelp(page);

  // A disk-backed File (via a file input), dropped with a real drop event
  await page.evaluate(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.id = 'e2e-file';
    input.style.display = 'none';
    document.body.appendChild(input);
  });
  await page.setInputFiles('#e2e-file', VIDEOS.two);
  await page.evaluate(() => {
    const input = document.getElementById('e2e-file') as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) throw new Error('no file');
    const dropzone = document.querySelector(
      'input[type=file]:not(#e2e-file)',
    )?.parentElement;
    if (!dropzone) throw new Error('no drop zone');
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    for (const type of ['dragenter', 'dragover', 'drop']) {
      dropzone.dispatchEvent(
        new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer }),
      );
    }
  });

  await expect.poll(() => videoCount(page)).toBe(2);
  await expect
    .poll(async () =>
      (await storedState(page))?.videos.map((video) => video.filePath),
    )
    .toEqual([VIDEOS.one, VIDEOS.two]);
});

test('every page renders without errors', async () => {
  running = await launchApp(test.info().outputPath('profile'), [
    VIDEOS.one,
    VIDEOS.two,
  ]);
  const { page } = running;
  await expect.poll(() => videoCount(page)).toBe(2);

  await goTo(page, '#/review');
  await expect(page.locator('main video')).toHaveCount(2);

  for (const [hash, heading] of [
    ['#/settings', 'Settings'],
    ['#/received_vods', 'Received VODs coming soon!'],
    ['#/about', 'About Vodon Pro'],
  ]) {
    await goTo(page, hash);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }

  await goTo(page, '#/');
  await expect(page.locator('main video')).toHaveCount(2);
});
