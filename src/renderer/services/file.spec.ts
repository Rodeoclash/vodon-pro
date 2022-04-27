import { basename } from './file';

test('basename', () => {
  expect(basename('movie.mp4')).toBe('movie');
});
