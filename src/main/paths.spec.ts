// @vitest-environment node
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  assetsPath,
  preloadPath,
  rendererDir,
  rendererUrl,
  resolveAppFile,
  unpackedBinaryPath,
} from './paths';

const mainDir = path.join('/app', 'out', 'main');

describe('rendererUrl', () => {
  test('uses the dev server when unpackaged and electron-vite gives a URL', () => {
    expect(rendererUrl(false, 'http://localhost:5173')).toBe(
      'http://localhost:5173',
    );
  });

  test('uses the app scheme when unpackaged without a dev server', () => {
    expect(rendererUrl(false, undefined)).toBe('app://vodon/index.html');
  });

  test('ignores a dev server URL once packaged', () => {
    expect(rendererUrl(true, 'http://localhost:5173')).toBe(
      'app://vodon/index.html',
    );
  });
});

describe('rendererDir', () => {
  test('is the renderer build beside main', () => {
    expect(rendererDir(mainDir)).toBe(path.join('/app', 'out', 'renderer'));
  });
});

describe('resolveAppFile', () => {
  const root = path.join('/app', 'out', 'renderer');

  test('maps / to index.html', () => {
    expect(resolveAppFile(root, '/')).toBe(path.join(root, 'index.html'));
  });

  test('maps a path to the file under the root', () => {
    expect(resolveAppFile(root, '/assets/index-abc.js')).toBe(
      path.join(root, 'assets', 'index-abc.js'),
    );
  });

  test('decodes the path', () => {
    expect(resolveAppFile(root, '/assets/a%20b.otf')).toBe(
      path.join(root, 'assets', 'a b.otf'),
    );
  });

  test.each([
    '/../main/main.js',
    '/assets/../../preload/preload.js',
    '/%2e%2e/%2e%2e/package.json',
    '/..%2f..%2fpackage.json',
    '/..%5c..%5cpackage.json',
    '/%E0%A4%A',
    '/index.html%00.js',
  ])('refuses %s', (urlPath) => {
    expect(resolveAppFile(root, urlPath)).toBeNull();
  });
});

describe('preloadPath', () => {
  test('is the preload bundle beside main', () => {
    expect(preloadPath(mainDir)).toBe(
      path.join('/app', 'out', 'preload', 'preload.js'),
    );
  });
});

describe('assetsPath', () => {
  test('is resources/assets when packaged', () => {
    expect(assetsPath(mainDir, true, path.join('/opt', 'resources'))).toBe(
      path.join('/opt', 'resources', 'assets'),
    );
  });

  test('is the repo assets folder when unpackaged', () => {
    expect(assetsPath(mainDir, false, '/unused')).toBe(
      path.join('/app', 'assets'),
    );
  });
});

describe('unpackedBinaryPath', () => {
  test('points into app.asar.unpacked', () => {
    const inAsar = path.join(
      '/opt',
      'resources',
      'app.asar',
      'node_modules',
      'ffmpeg-ffprobe-static',
      'ffprobe',
    );
    expect(unpackedBinaryPath(inAsar)).toBe(
      path.join(
        '/opt',
        'resources',
        'app.asar.unpacked',
        'node_modules',
        'ffmpeg-ffprobe-static',
        'ffprobe',
      ),
    );
  });

  test('leaves an unpackaged path alone', () => {
    const local = path.join('/app', 'node_modules', 'ffmpeg-ffprobe-static');
    expect(unpackedBinaryPath(local)).toBe(local);
  });

  test('does not touch a folder that merely starts with app.asar', () => {
    const odd = path.join('/home', 'app.asarnot', 'ffprobe');
    expect(unpackedBinaryPath(odd)).toBe(odd);
  });
});
