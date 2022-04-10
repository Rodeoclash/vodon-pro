export function secondsToHms(input: number) {
  var hours = Math.floor(input / 3600);
  var minutes = Math.floor(input / 60) % 60;
  var seconds = input % 60;

  return [hours, minutes, seconds]
    .map((v) => (v < 10 ? "0" + v : v))
    .filter((v, i) => v !== "00" || i > 0)
    .join(":");
}
