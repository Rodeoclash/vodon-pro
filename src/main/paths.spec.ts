// @vitest-environment node
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  assetsPath,
  preloadPath,
  rendererLocation,
  unpackedBinaryPath,
} from './paths';

const mainDir = path.join('/app', 'out', 'main');

describe('rendererLocation', () => {
  test('uses the dev server when unpackaged and electron-vite gives a URL', () => {
    expect(
      rendererLocation(mainDir, false, 'http://localhost:5173'),
    ).toStrictEqual({ kind: 'url', url: 'http://localhost:5173' });
  });

  test('uses the built HTML when unpackaged without a dev server', () => {
    expect(rendererLocation(mainDir, false, undefined)).toStrictEqual({
      kind: 'file',
      file: path.join('/app', 'out', 'renderer', 'index.html'),
    });
  });

  test('ignores a dev server URL once packaged', () => {
    expect(
      rendererLocation(mainDir, true, 'http://localhost:5173'),
    ).toStrictEqual({
      kind: 'file',
      file: path.join('/app', 'out', 'renderer', 'index.html'),
    });
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
