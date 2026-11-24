import fs from 'node:fs';
import { expect, test } from '@playwright/test';
import { mediaUrl } from '../src/shared/mediaUrl';
import {
  launchApp,
  type RunningApp,
  VIDEO_DIR,
  VIDEOS,
  videoCount,
} from './app';

let running: RunningApp;

test.beforeEach(async () => {
  running = await launchApp(test.info().outputPath('profile'), [VIDEOS.one]);
  await expect.poll(() => videoCount(running.page)).toBe(1);
});

test.afterEach(async () => {
  expect(running.errors).toEqual([]);
  await running.app.close();
});

type Fetched = {
  status: number;
  contentRange: string | null;
  contentType: string | null;
  length: number;
};

/** Request a URL from the main process, through our protocol handler. */
const mainFetch = (url: string, range?: string) =>
  running.app.evaluate(
    async ({ net }, [target, rangeHeader]) => {
      const response = await net.fetch(target, {
        headers: rangeHeader ? { Range: rangeHeader } : {},
      });
      const body = await response.arrayBuffer();
      return {
        status: response.status,
        contentRange: response.headers.get('Content-Range'),
        contentType: response.headers.get('Content-Type'),
        length: body.byteLength,
      } satisfies Fetched;
    },
    [url, range] as const,
  );

test('videos play from vodon-media URLs and can seek', async () => {
  const { page } = running;
  const sources = await page.evaluate(() =>
    Array.from(document.querySelectorAll('video')).map((el) => el.currentSrc),
  );
  expect(sources).toEqual([mediaUrl(VIDEOS.one)]);

  // Seek near the end: needs range requests
  await page.evaluate(() => {
    document.querySelectorAll('video')[0].currentTime = 7.5;
  });
  await expect
    .poll(() =>
      page.evaluate(() => {
        const el = document.querySelectorAll('video')[0];
        return el.readyState >= 2 && !el.seeking && el.error === null;
      }),
    )
    .toBe(true);
});

test('the media protocol serves byte ranges', async () => {
  const size = fs.statSync(VIDEOS.one).size;

  const whole = await mainFetch(mediaUrl(VIDEOS.one));
  expect(whole).toEqual({
    status: 200,
    contentRange: null,
    contentType: 'video/mp4',
    length: size,
  });

  expect(await mainFetch(mediaUrl(VIDEOS.one), 'bytes=100-199')).toEqual({
    status: 206,
    contentRange: `bytes 100-199/${size}`,
    contentType: 'video/mp4',
    length: 100,
  });

  expect((await mainFetch(mediaUrl(VIDEOS.one), `bytes=${size}-`)).status).toBe(
    416,
  );
});

test('the media protocol only serves absolute paths to files', async () => {
  expect((await mainFetch(mediaUrl('e2e/.videos/player1.mp4'))).status).toBe(
    400,
  );
  expect((await mainFetch(mediaUrl(VIDEO_DIR))).status).toBe(404);
  expect((await mainFetch(mediaUrl(`${VIDEO_DIR}/missing.mp4`))).status).toBe(
    404,
  );
  expect((await mainFetch('vodon-media://other/x')).status).toBe(400);
});

test('page scripts cannot read media bytes', async () => {
  const { page } = running;
  const result = await page.evaluate(
    (url) =>
      fetch(url).then(
        (response) => `read ${response.status}`,
        () => 'refused',
      ),
    mediaUrl(VIDEOS.one),
  );
  expect(result).toBe('refused');
  // Chromium logs the refusal (by the CSP, or by the scheme having no
  // fetch support); that's the expected outcome here
  running.errors = running.errors.filter(
    (error) => !error.includes('vodon-media://'),
  );
});
