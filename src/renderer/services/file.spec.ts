import { basename, getPossibleArgVMoviePaths } from './file';

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
      getPossibleArgVMoviePaths(['C:\\Users\\person\\vodon.exe'])
    ).toStrictEqual([]);
  });

  test('when a filepath', () => {
    expect(
      getPossibleArgVMoviePaths([
        'C:\\Users\\person\\vodon.exe',
        'C:\\movie.mp4',
      ])
    ).toStrictEqual(['C:\\movie.mp4']);
  });
});
