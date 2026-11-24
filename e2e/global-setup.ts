import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { FFMPEG, VIDEO_DIR, VIDEOS } from './app';

/**
 * Make two short test videos (8s, 1280x720, 30fps, H.264 + AAC) with the
 * bundled ffmpeg. Kept between runs.
 */
export default function globalSetup() {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });

  for (const [file, frequency] of [
    [VIDEOS.one, 440],
    [VIDEOS.two, 660],
  ] as const) {
    if (fs.existsSync(file)) continue;

    execFileSync(FFMPEG, [
      '-loglevel',
      'error',
      '-f',
      'lavfi',
      '-i',
      'testsrc2=size=1280x720:rate=30:duration=8',
      '-f',
      'lavfi',
      '-i',
      `sine=frequency=${frequency}:duration=8`,
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-shortest',
      file,
    ]);
  }
}
