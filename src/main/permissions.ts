/**
 * The only browser permissions the app uses: fullscreen for the review
 * player, and clipboard writes (tldraw's copy). Everything else (camera,
 * microphone, notifications, geolocation, ...) is refused.
 */
const ALLOWED_PERMISSIONS = new Set([
  'fullscreen',
  'clipboard-sanitized-write',
]);

/** Whether to grant `permission` to a page at `requestingUrl`. */
export function isPermissionAllowed(
  permission: string,
  requestingUrl: string,
  appUrl: string,
): boolean {
  if (!ALLOWED_PERMISSIONS.has(permission)) return false;
  try {
    return new URL(requestingUrl).origin === new URL(appUrl).origin;
  } catch {
    return false;
  }
}
