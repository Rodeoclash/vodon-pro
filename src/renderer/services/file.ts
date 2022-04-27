/**
 *
 * @param {string} name A filename including an extension (i.e. movie.mp4)
 * @returns {string} The given string without the extension (i.e. movie)
 */
// eslint-disable-next-line import/prefer-default-export
export const basename = (name: string): string => {
  const result = /([^/\\]*|\.[^/\\]*)\..*$/gm.exec(name);
  return result ? result[1] : name;
};
