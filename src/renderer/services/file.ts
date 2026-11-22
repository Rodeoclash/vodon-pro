const SUPPORTED_EXTENSIONS = ['mp4', 'webm', 'avi'];

/**
 * Returns the basename of the file path. Used to prefill default video names
 * from the name of the file on disk.
 */
export const basename = (name: string): string => {
  const result = /([^/\\]*|\.[^/\\]*)\..*$/gm.exec(name);
  return result ? result[1] : name;
};

/**
 * Given a list of argV type string values, pull out any filepaths from them
 * to prefill videos.
 */
export const getPossibleArgVMoviePaths = (
  possiblePaths: Array<string>,
): Array<string> => {
  return possiblePaths.reduce((acc: Array<string>, possiblePath: string) => {
    const containsExtension = SUPPORTED_EXTENSIONS.some((extension) => {
      return possiblePath.includes(extension);
    });

    if (containsExtension === true) {
      acc.push(possiblePath);
    }

    return acc;
  }, []);
};

/**
 * Paths on disk for dropped or picked files. Electron gives no path for a
 * File that isn't backed by a file on disk (an empty string), so those are
 * skipped.
 */
export const getDiskPaths = (
  files: Array<File>,
  getPathForFile: (file: File) => string,
): Array<string> => {
  return files.map(getPathForFile).filter((filePath) => filePath !== '');
};
