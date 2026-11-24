/**
 * Local videos are played through our own scheme rather than file:// URLs:
 * vodon-media://video/<the file's absolute path, URI-encoded as one segment>.
 * Built in the renderer, served by the main process (src/main/protocols.ts).
 */
export const MEDIA_SCHEME = 'vodon-media';
const HOST = 'video';

export function mediaUrl(filePath: string): string {
  return `${MEDIA_SCHEME}://${HOST}/${encodeURIComponent(filePath)}`;
}

/** The file path a media URL points at, or null if it isn't one of ours. */
export function filePathFromMediaUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== `${MEDIA_SCHEME}:` || parsed.host !== HOST) {
    return null;
  }

  const encoded = parsed.pathname.slice(1);
  if (encoded === '' || encoded.includes('/')) return null;

  try {
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
}
