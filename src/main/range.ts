export type ByteRange = { start: number; end: number };

/**
 * Parse an HTTP Range header for a file of `size` bytes. <video> asks for
 * ranges as it seeks. Returns the (inclusive) range, null to send the whole
 * file, or 'unsatisfiable' for a range outside the file. Only single
 * `bytes=` ranges are supported, which is all media elements send.
 */
export function parseRange(
  header: string | null,
  size: number,
): ByteRange | null | 'unsatisfiable' {
  if (header === null) return null;

  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;

  const [, startText, endText] = match;
  if (startText === '' && endText === '') return null;

  if (startText === '') {
    // Suffix range: the last N bytes
    const length = Number(endText);
    if (length === 0 || size === 0) return 'unsatisfiable';
    return { start: Math.max(0, size - length), end: size - 1 };
  }

  const start = Number(startText);
  const end = endText === '' ? size - 1 : Math.min(Number(endText), size - 1);
  if (start >= size || start > end) return 'unsatisfiable';
  return { start, end };
}
