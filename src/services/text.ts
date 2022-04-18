export function truncateString(str: string, n: number) {
  if (str.length > n) {
    return str.substring(0, n) + "...";
  } else {
    return str;
  }
}
