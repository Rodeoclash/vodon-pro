// @vitest-environment node
import { describe, expect, test } from 'vitest';
import { parseRange } from './range';

describe('parseRange', () => {
  test('no header means the whole file', () => {
    expect(parseRange(null, 1000)).toBeNull();
  });

  test('an open-ended range runs to the end', () => {
    expect(parseRange('bytes=0-', 1000)).toEqual({ start: 0, end: 999 });
    expect(parseRange('bytes=500-', 1000)).toEqual({ start: 500, end: 999 });
  });

  test('a closed range', () => {
    expect(parseRange('bytes=100-199', 1000)).toEqual({ start: 100, end: 199 });
  });

  test('an end past the file is clamped', () => {
    expect(parseRange('bytes=900-5000', 1000)).toEqual({
      start: 900,
      end: 999,
    });
  });

  test('a suffix range is the last N bytes', () => {
    expect(parseRange('bytes=-100', 1000)).toEqual({ start: 900, end: 999 });
    expect(parseRange('bytes=-5000', 1000)).toEqual({ start: 0, end: 999 });
  });

  test('ranges outside the file are unsatisfiable', () => {
    expect(parseRange('bytes=1000-', 1000)).toBe('unsatisfiable');
    expect(parseRange('bytes=200-100', 1000)).toBe('unsatisfiable');
    expect(parseRange('bytes=-0', 1000)).toBe('unsatisfiable');
    expect(parseRange('bytes=0-', 0)).toBe('unsatisfiable');
  });

  test('headers we do not understand mean the whole file', () => {
    expect(parseRange('bytes=0-1,5-9', 1000)).toBeNull();
    expect(parseRange('items=0-1', 1000)).toBeNull();
    expect(parseRange('bytes=-', 1000)).toBeNull();
  });
});
