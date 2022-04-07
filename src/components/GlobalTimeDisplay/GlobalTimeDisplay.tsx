import useStore from "../../services/store";

import { secondsToHms } from "../../services/time";

import { Text } from "@chakra-ui/react";

export default function GlobalTimeDisplay() {
  const currentTime = useStore((state) => state.currentTime);
  const maxDuration = useStore((state) => state.maxDuration);

  return (
    <Text whiteSpace={"nowrap"} fontSize={"sm"} align={"center"}>
      {secondsToHms(Math.round(currentTime))} /{" "}
      {secondsToHms(Math.round(maxDuration))}
    </Text>
  );
}
