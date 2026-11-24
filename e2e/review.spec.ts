import { expect, type Page, test } from '@playwright/test';
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

test.beforeEach(async () => {
  const testInfo = test.info();
  running = await launchApp(testInfo.outputPath('profile'), [
    VIDEOS.one,
    VIDEOS.two,
  ]);
  const { page } = running;
  await expect.poll(() => videoCount(page)).toBe(2);
  await dismissHelp(page);
});

test.afterEach(async () => {
  expect(running.errors).toEqual([]);
  await running.app.close();
});

const times = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('video')).map((el) => ({
      time: el.currentTime,
      paused: el.paused,
      error: el.error?.message ?? null,
    })),
  );

/** Review-page controls only render while the pointer is over the video. */
async function hoverVideo(page: Page) {
  await page.mouse.move(700, 500);
  await page.mouse.move(720, 520);
  await page.waitForTimeout(300);
}

test('plays every video in sync, offset by their sync times', async () => {
  const { page } = running;

  // Player 2's moment at 2s matches player 1's start
  await page.evaluate(() => {
    document.querySelectorAll('video')[1].currentTime = 2;
  });
  await expect
    .poll(async () => (await storedState(page))?.videos[1].syncTime)
    .toBeCloseTo(2, 1);

  await goTo(page, '#/review');
  // Known bug: the review page only applies new offsets on the next seek,
  // so step a frame first (otherwise both start at 0).
  await page.keyboard.press('d');
  await expect.poll(async () => (await times(page))[1].time).toBeGreaterThan(2);
  await page.keyboard.press('Space');
  await expect
    .poll(async () => (await times(page))[0].time, { timeout: 10_000 })
    .toBeGreaterThan(1.5);
  await page.keyboard.press('Space');
  await expect.poll(async () => (await times(page))[0].paused).toBe(true);

  const [one, two] = await times(page);
  expect(one.error).toBeNull();
  expect(two.error).toBeNull();
  expect(two.time - one.time).toBeCloseTo(2, 0);
});

test('a bookmark keeps a pencil drawing', async () => {
  const { page } = running;
  await goTo(page, '#/review');
  await hoverVideo(page);

  await page.locator('button[aria-label="Bookmark this moment"]').click();
  await expect(page.locator('textarea')).toHaveCount(1);

  await page.locator('button[aria-label="Pencil"]').click();
  await page.mouse.move(300, 300);
  await page.mouse.down();
  for (let i = 1; i <= 15; i++) {
    await page.mouse.move(300 + i * 20, 300 + i * 10);
  }
  await page.mouse.up();

  await expect
    .poll(async () =>
      JSON.stringify((await storedState(page))?.videos[0].bookmarks[0].drawing),
    )
    .toContain('"type":"draw"');

  // Playing closes the bookmark editor
  await page.mouse.click(10, 500);
  await page.keyboard.press('Space');
  await expect(page.locator('textarea')).toHaveCount(0);
  await page.keyboard.press('Space');
});

test('the sidebar resizes and number keys switch the active video', async () => {
  const { page } = running;
  await goTo(page, '#/review');

  const sidebarWidth = () =>
    page.evaluate(() => {
      const videos = document.querySelectorAll('video');
      return Math.round(
        videos[videos.length - 1]?.getBoundingClientRect().width ?? 0,
      );
    });
  const handle = await page.locator('.react-draggable').first().boundingBox();
  if (!handle) throw new Error('no sidebar handle');
  const before = await sidebarWidth();
  const x = handle.x + handle.width / 2;
  await page.mouse.move(x, handle.y + 300);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) {
    await page.mouse.move(x - i * 30, handle.y + 300);
  }
  await page.mouse.up();
  await expect.poll(sidebarWidth).toBeGreaterThan(before + 200);

  const state = await storedState(page);
  const [first, second] = state?.videos.map((video) => video.id) ?? [];
  await page.keyboard.press('2');
  await expect
    .poll(async () => (await storedState(page))?.activeVideoId)
    .toBe(second);
  await page.keyboard.press('1');
  await expect
    .poll(async () => (await storedState(page))?.activeVideoId)
    .toBe(first);
});
