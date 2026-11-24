// @vitest-environment node
import { describe, expect, test } from 'vitest';
import { filePathFromMediaUrl, mediaUrl } from './mediaUrl';

describe('mediaUrl / filePathFromMediaUrl', () => {
  test.each([
    '/home/coach/Videos/scrim 1.mp4',
    'C:\\Users\\Coach\\Videos\\scrim #2 (final).mp4',
    '\\\\nas\\share\\vods\\100% clutch?.webm',
    '/Users/coach/Movies/ünïcödé 日本.mov',
    '/tmp/a%2Fb..mp4',
  ])('round-trips %s', (filePath) => {
    const url = mediaUrl(filePath);
    expect(url.startsWith('vodon-media://video/')).toBe(true);
    expect(filePathFromMediaUrl(url)).toBe(filePath);
  });

  test.each([
    'file:///etc/passwd',
    'https://video/%2Fetc%2Fpasswd',
    'vodon-media://other/%2Fetc%2Fpasswd',
    'vodon-media://video/',
    'vodon-media://video/a/b',
    'vodon-media://video/%E0%A4%A',
    'not a url',
  ])('rejects %s', (url) => {
    expect(filePathFromMediaUrl(url)).toBeNull();
  });
});
