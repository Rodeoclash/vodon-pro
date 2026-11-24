import fs from 'node:fs';
import fsPromise from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { protocol } from 'electron';
import log from 'electron-log/main';
import { filePathFromMediaUrl, MEDIA_SCHEME } from '../shared/mediaUrl';
import { parseRange } from './range';

const VIDEO_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.mkv': 'video/x-matroska',
  '.avi': 'video/x-msvideo',
};

/**
 * Must run before the app is ready. The media scheme can stream (seeking
 * needs range requests) but deliberately has no fetch or CORS privileges:
 * a <video> can play a file, page scripts can't read its bytes.
 */
export function registerPrivilegedSchemes(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: MEDIA_SCHEME,
      privileges: { standard: true, secure: true, stream: true },
    },
  ]);
}

/** Serve vodon-media:// URLs from local files, with byte ranges. */
export function handleMediaProtocol(): void {
  protocol.handle(MEDIA_SCHEME, async (request) => {
    const filePath = filePathFromMediaUrl(request.url);
    if (filePath === null || !path.isAbsolute(filePath)) {
      return new Response(null, { status: 400 });
    }

    let size: number;
    try {
      const stats = await fsPromise.stat(filePath);
      if (!stats.isFile()) return new Response(null, { status: 404 });
      size = stats.size;
    } catch {
      return new Response(null, { status: 404 });
    }

    const headers = new Headers({
      'Accept-Ranges': 'bytes',
      'Content-Type':
        VIDEO_TYPES[path.extname(filePath).toLowerCase()] ??
        'application/octet-stream',
    });

    const range = parseRange(request.headers.get('Range'), size);
    if (range === 'unsatisfiable') {
      headers.set('Content-Range', `bytes */${size}`);
      return new Response(null, { status: 416, headers });
    }

    const { start, end } = range ?? { start: 0, end: size - 1 };
    headers.set('Content-Length', String(end - start + 1));
    if (range) headers.set('Content-Range', `bytes ${start}-${end}/${size}`);

    const stream = fs.createReadStream(filePath, { start, end });
    stream.on('error', (error) => log.error('Media stream failed', error));

    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: range ? 206 : 200,
      headers,
    });
  });
}
