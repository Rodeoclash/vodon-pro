/** Schemes we hand to the OS (browser, mail client). */
const EXTERNAL_PROTOCOLS = new Set(['https:', 'http:', 'mailto:']);

/**
 * Whether a URL is safe to pass to shell.openExternal. Anything else
 * (file:, custom app schemes, javascript:, garbage) could launch local
 * programs or files, so it is refused.
 */
export function isSafeExternalUrl(url: string): boolean {
  try {
    return EXTERNAL_PROTOCOLS.has(new URL(url).protocol);
  } catch {
    return false;
  }
}

/**
 * Whether navigating from `current` to `target` stays on the app's page.
 * The app is a single page with hash routes, so the only navigation it
 * makes is reloading the same document (e.g. a dev reload); anything
 * else would put another page in a window that has our preload.
 */
export function isSameDocument(current: string, target: string): boolean {
  try {
    const from = new URL(current);
    const to = new URL(target);
    from.hash = '';
    to.hash = '';
    return from.href === to.href;
  } catch {
    return false;
  }
}
