export function getRatioDimensions(
  displayAspectRatio: string,
  element: HTMLElement
): [number, number] {
  const [widthSplit, heightSplit] = displayAspectRatio.split(":");
  const width = parseInt(widthSplit, 10);
  const height = parseInt(heightSplit, 10);

  const ratioWidthHeight = width / height;
  const ratioHeightWidth = height / width;

  const containerWidth = element.offsetWidth;
  const containerHeight = element.offsetHeight;

  if (containerHeight * ratioWidthHeight <= containerWidth) {
    return [containerHeight * ratioWidthHeight, containerHeight];
  } else {
    return [containerWidth, containerWidth * ratioHeightWidth];
  }
}
