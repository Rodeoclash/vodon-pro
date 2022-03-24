const ratio169 = 16 / 9;
const ratio916 = 9 / 16;

export function getRatioDimensions(element: HTMLElement): [number, number] {
  const containerWidth = element.offsetWidth;
  const containerHeight = element.offsetHeight;

  if (containerHeight * ratio169 <= containerWidth) {
    const height = containerHeight;
    const width = containerHeight * ratio169;
    return [width, height];
  } else {
    const width = containerWidth;
    const height = containerWidth * ratio916;
    return [width, height];
  }
}
