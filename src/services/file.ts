/**
 *
 * @param {string} name A filename including an extension (i.e. movie.mp4)
 * @returns {string} The given string without the extension (i.e. movie)
 */
export const basename = (name: string): string =>
  /([^\/\\]*|\.[^\/\\]*)\..*$/gm.exec(name)[1];
