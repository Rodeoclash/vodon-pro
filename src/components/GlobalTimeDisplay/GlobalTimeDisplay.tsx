import useStore from "../../services/store";

import { secondsToHms } from "../../services/time";

import { Text } from "@chakra-ui/react";

export default function GlobalTimeDisplay() {
  const currentTime = useStore((state) => state.currentTime);
  const fullDuration = useStore((state) => state.fullDuration);

  return (
    <Text whiteSpace={"nowrap"} fontSize={"sm"} align={"center"}>
      {secondsToHms(Math.round(currentTime))} /{" "}
      {secondsToHms(Math.round(fullDuration))}
    </Text>
  );
}
