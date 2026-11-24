import { describe, expect, test } from 'vitest';
import { basename, getDiskPaths, getPossibleArgVMoviePaths } from './file';

describe('basename', () => {
  test('when exists', () => {
    expect(basename('movie.mp4')).toBe('movie');
  });

  test('with no extension, just echos input', () => {
    expect(basename('movie')).toBe('movie');
  });

  test('takes the file name from a full path', () => {
    expect(basename('/vods/player1.mp4')).toBe('player1');
    expect(basename('C:\\Users\\coach\\Videos\\scrim.mp4')).toBe('scrim');
  });

  test('ignores dots in folder names', () => {
    expect(basename('C:\\Users\\j.smith\\Videos\\scrim.mp4')).toBe('scrim');
    expect(basename('/home/sam/.local/vods/round1.mp4')).toBe('round1');
  });

  test('only strips the last extension', () => {
    expect(basename('/vods/match.final.mp4')).toBe('match.final');
  });

  test('keeps a leading dot', () => {
    expect(basename('/vods/.hidden')).toBe('.hidden');
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

  test('matches the extension case-insensitively', () => {
    expect(
      getPossibleArgVMoviePaths(['/videos/a.MP4', '/videos/b.WebM']),
    ).toStrictEqual(['/videos/a.MP4', '/videos/b.WebM']);
  });

  test('ignores arguments that only contain an extension name', () => {
    expect(
      getPossibleArgVMoviePaths([
        'C:\\Users\\David\\AppData\\Local\\Programs\\VodonPro\\VodonPro.exe',
        '--user-data-dir=/tmp/navigated-away',
        '/home/me/mp4-exports/notes.txt',
      ]),
    ).toStrictEqual([]);
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
