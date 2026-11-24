// @vitest-environment node
import { describe, expect, test } from 'vitest';
import { isSafeExternalUrl, isSameDocument } from './navigation';

describe('isSafeExternalUrl', () => {
  test.each([
    'https://discord.gg/EaJdhHtZEk',
    'http://example.com/',
    'mailto:someone@example.com',
  ])('allows %s', (url) => {
    expect(isSafeExternalUrl(url)).toBe(true);
  });

  test.each([
    'file:///C:/Windows/System32/calc.exe',
    'file:///etc/passwd',
    'javascript:alert(1)',
    'smb://attacker/share',
    'ms-msdt:/id PCWDiagnostic',
    'vodon-media://video/x',
    'not a url',
    '',
  ])('refuses %s', (url) => {
    expect(isSafeExternalUrl(url)).toBe(false);
  });
});

describe('isSameDocument', () => {
  const page = 'file:///opt/app/out/renderer/index.html#/review';

  test('allows a change of hash route', () => {
    expect(
      isSameDocument(page, 'file:///opt/app/out/renderer/index.html#/'),
    ).toBe(true);
  });

  test('allows reloading the dev server page', () => {
    expect(
      isSameDocument('http://localhost:5173/#/', 'http://localhost:5173/'),
    ).toBe(true);
  });

  test('refuses another local file', () => {
    expect(isSameDocument(page, 'file:///home/user/evil.html')).toBe(false);
  });

  test('refuses a web page', () => {
    expect(isSameDocument(page, 'https://example.com/')).toBe(false);
  });

  test('refuses an unparseable URL', () => {
    expect(isSameDocument(page, 'nope')).toBe(false);
  });
});
