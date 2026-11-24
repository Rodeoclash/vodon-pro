// @vitest-environment node
import { describe, expect, test } from 'vitest';
import { isPermissionAllowed } from './permissions';

const app = 'app://vodon/index.html#/review';

describe('isPermissionAllowed', () => {
  test.each(['fullscreen', 'clipboard-sanitized-write'])(
    'grants %s to the app',
    (permission) => {
      expect(isPermissionAllowed(permission, 'app://vodon/', app)).toBe(true);
    },
  );

  test('grants to the dev server when that is the app', () => {
    expect(
      isPermissionAllowed(
        'fullscreen',
        'http://localhost:5173/',
        'http://localhost:5173/#/',
      ),
    ).toBe(true);
  });

  test.each([
    'media',
    'notifications',
    'geolocation',
    'clipboard-read',
    'openExternal',
    'hid',
  ])('refuses %s', (permission) => {
    expect(isPermissionAllowed(permission, 'app://vodon/', app)).toBe(false);
  });

  test('refuses another origin', () => {
    expect(isPermissionAllowed('fullscreen', 'https://example.com/', app)).toBe(
      false,
    );
  });

  test('refuses an unparseable origin', () => {
    expect(isPermissionAllowed('fullscreen', '', app)).toBe(false);
  });
});
