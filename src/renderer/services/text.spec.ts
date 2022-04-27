import { truncateString } from './text';

describe('truncateString', () => {
  test('without truncation', () => {
    expect(truncateString('short', 50)).toBe('short');
  });

  describe('with truncation', () => {
    expect(truncateString('short', 2)).toBe('sh...');
  });
});
