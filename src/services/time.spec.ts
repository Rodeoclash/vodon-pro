import { secondsToHms } from "./time";

test("secondsToHms", () => {
  expect(secondsToHms(1999)).toBe("33:19");
});
