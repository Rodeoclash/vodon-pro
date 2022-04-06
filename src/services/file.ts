export const basename = (name: string): string =>
  /([^\/\\]*|\.[^\/\\]*)\..*$/gm.exec(name)[1];
