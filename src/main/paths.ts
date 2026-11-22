import path from 'node:path';

/**
 * Where the window loads its page from: electron-vite's dev server while
 * developing (it sets ELECTRON_RENDERER_URL), otherwise the built HTML next
 * to the main bundle (out/main → out/renderer).
 */
export type RendererLocation =
  | { kind: 'url'; url: string }
  | { kind: 'file'; file: string };

export function rendererLocation(
  mainDir: string,
  isPackaged: boolean,
  devServerUrl: string | undefined,
): RendererLocation {
  if (!isPackaged && devServerUrl) {
    return { kind: 'url', url: devServerUrl };
  }

  return { kind: 'file', file: path.join(mainDir, '../renderer/index.html') };
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
