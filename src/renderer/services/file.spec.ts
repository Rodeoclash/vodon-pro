import { basename } from './file';

describe('basename', () => {
  test('when exists', () => {
    expect(basename('movie.mp4')).toBe('movie');
  });

  test('with no extension, just echos input', () => {
    expect(basename('movie')).toBe('movie');
  });
});
