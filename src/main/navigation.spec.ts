// @vitest-environment node
import { describe, expect, test } from 'vitest';
import {
  isSafeExternalUrl,
  isSameDocument,
  isTrustedSender,
} from './navigation';

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

describe('isTrustedSender', () => {
  const app = 'file:///opt/app/out/renderer/index.html#/';

  test('trusts the top frame on the app page', () => {
    expect(
      isTrustedSender(
        'file:///opt/app/out/renderer/index.html#/review',
        true,
        app,
      ),
    ).toBe(true);
  });

  test('refuses a subframe, even on the app page', () => {
    expect(
      isTrustedSender('file:///opt/app/out/renderer/index.html', false, app),
    ).toBe(false);
  });

  test('refuses another page', () => {
    expect(isTrustedSender('https://example.com/', true, app)).toBe(false);
  });

  test('refuses a sender whose frame has gone', () => {
    expect(isTrustedSender(undefined, true, app)).toBe(false);
  });
});
