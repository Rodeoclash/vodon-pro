import fs from 'node:fs';
import fsPromise from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { protocol } from 'electron';
import log from 'electron-log/main';
import { filePathFromMediaUrl, MEDIA_SCHEME } from '../shared/mediaUrl';
import { resolveAppFile } from './paths';
import { parseRange } from './range';

const APP_SCHEME = 'app';

const APP_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/**
 * Content Security Policy for the built app. Scripts only from the app
 * itself, no inline script. Inline styles are allowed because emotion
 * (Chakra) injects <style> tags. The only network access is Google Fonts,
 * which tldraw v1 loads for text in drawings; drop it when tldraw goes.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob:",
  "font-src 'self' data: https://fonts.gstatic.com",
  `media-src ${MEDIA_SCHEME}:`,
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

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
      // The app's own origin: a standard, secure scheme so it gets
      // localStorage and same-origin rules like a web page.
      scheme: APP_SCHEME,
      privileges: { standard: true, secure: true, supportFetchAPI: true },
    },
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

/**
 * Serve the built renderer (rootDir) on app://vodon/, with the CSP on
 * every response. Nothing outside rootDir can be reached.
 */
export function handleAppProtocol(rootDir: string): void {
  protocol.handle(APP_SCHEME, async (request) => {
    const { host, pathname } = new URL(request.url);
    const filePath =
      host === 'vodon' ? resolveAppFile(rootDir, pathname) : null;
    if (filePath === null) return new Response(null, { status: 404 });

    try {
      const body = await fsPromise.readFile(filePath);
      return new Response(body, {
        headers: {
          'Content-Type':
            APP_TYPES[path.extname(filePath).toLowerCase()] ??
            'application/octet-stream',
          'Content-Security-Policy': CONTENT_SECURITY_POLICY,
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch {
      return new Response(null, { status: 404 });
    }
  });
}
