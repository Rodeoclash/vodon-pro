import path from 'node:path';

/**
 * Since Electron 43, open/save dialogs without a defaultPath start in
 * Downloads and the OS no longer remembers where the user last was. This
 * remembers the folder of the last project opened or saved (for the
 * session) so the next dialog starts there.
 */
export function createLastFolder(initialFolder: string) {
  let folder = initialFolder;

  return {
    get: (): string => folder,
    rememberFile: (filePath: string): void => {
      folder = path.dirname(filePath);
    },
  };
}
