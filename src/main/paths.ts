import path from 'node:path';

/** The built app is served from this origin (see protocols.ts). */
const APP_ORIGIN = 'app://vodon';

/**
 * The URL the window loads: electron-vite's dev server while developing (it
 * sets ELECTRON_RENDERER_URL), otherwise the built app on the app:// scheme.
 */
export function rendererUrl(
  isPackaged: boolean,
  devServerUrl: string | undefined,
): string {
  if (!isPackaged && devServerUrl) return devServerUrl;
  return `${APP_ORIGIN}/index.html`;
}

/** The built renderer, next to the main bundle (out/main → out/renderer). */
export function rendererDir(mainDir: string): string {
  return path.join(mainDir, '../renderer');
}

/**
 * The file under rootDir that an app:// URL path refers to, or null if it
 * would escape rootDir (or can't be decoded). "/" is index.html.
 */
export function resolveAppFile(
  rootDir: string,
  urlPathname: string,
): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(urlPathname);
  } catch {
    return null;
  }
  // No built file has a backslash or NUL in its name; refuse them so paths
  // behave the same on Windows, where a backslash is a separator.
  if (decoded.includes('\0') || decoded.includes('\\')) return null;

  const relative = decoded.replace(/^\/+/, '') || 'index.html';
  const root = path.resolve(rootDir);
  const resolved = path.resolve(root, relative);
  return resolved.startsWith(root + path.sep) ? resolved : null;
}

/** The preload bundle, built alongside main (out/main → out/preload). */
export function preloadPath(mainDir: string): string {
  return path.join(mainDir, '../preload/preload.js');
}

/**
 * Bundled assets (icons): copied to resources/assets by electron-builder's
 * extraResources when packaged, the repo's assets/ folder otherwise.
 */
export function assetsPath(
  mainDir: string,
  isPackaged: boolean,
  resourcesPath: string,
): string {
  return isPackaged
    ? path.join(resourcesPath, 'assets')
    : path.join(mainDir, '../../assets');
}

/**
 * ffmpeg-ffprobe-static resolves its binaries next to its own module, which
 * is inside app.asar when packaged. Executables can't run from inside the
 * archive, so electron-builder unpacks the package (asarUnpack) and we point
 * at the unpacked copy.
 */
export function unpackedBinaryPath(binaryPath: string): string {
  return binaryPath.replace(
    `${path.sep}app.asar${path.sep}`,
    `${path.sep}app.asar.unpacked${path.sep}`,
  );
}
