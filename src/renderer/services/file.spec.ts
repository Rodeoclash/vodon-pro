import { describe, expect, test } from 'vitest';
import { basename, getDiskPaths, getPossibleArgVMoviePaths } from './file';

describe('basename', () => {
  test('when exists', () => {
    expect(basename('movie.mp4')).toBe('movie');
  });

  test('with no extension, just echos input', () => {
    expect(basename('movie')).toBe('movie');
  });
});

describe('getPossibleArgVMoviePaths', () => {
  test('when just executable passed', () => {
    expect(
      getPossibleArgVMoviePaths(['C:\\Users\\person\\vodon.exe']),
    ).toStrictEqual([]);
  });

  test('when a filepath', () => {
    expect(
      getPossibleArgVMoviePaths([
        'C:\\Users\\person\\vodon.exe',
        'C:\\movie.mp4',
      ]),
    ).toStrictEqual(['C:\\movie.mp4']);
  });
});

describe('getDiskPaths', () => {
  const pathFor = (file: File) =>
    file.name === 'in-memory.mp4' ? '' : `/videos/${file.name}`;

  test('maps each file to its path on disk', () => {
    const files = [new File([], 'a.mp4'), new File([], 'b.mp4')];
    expect(getDiskPaths(files, pathFor)).toStrictEqual([
      '/videos/a.mp4',
      '/videos/b.mp4',
    ]);
  });

  test('skips files Electron has no path for', () => {
    const files = [new File([], 'in-memory.mp4'), new File([], 'c.mp4')];
    expect(getDiskPaths(files, pathFor)).toStrictEqual(['/videos/c.mp4']);
  });
});
