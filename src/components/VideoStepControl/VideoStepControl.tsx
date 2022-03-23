import { IconButton } from "@chakra-ui/react";

import { PlayerTrackPrev as PlayerTrackPrevIcon, PlayerTrackNext as PlayerTrackNextIcon } from "tabler-icons-react";

interface Props {
  direction: "forwards" | "backwards";
  frameRate: number;
  onClick: (value: number) => void;
}

export default function VideoStepControl({ onClick, frameRate, direction }: Props) {
  const [value, Icon] = direction === "forwards" ? [1, <PlayerTrackNextIcon />] : [-1, <PlayerTrackPrevIcon />];
  const frameLength = 1 / frameRate;

  function handleClick(event: any) {
    console.log("fix any", event);

    const distance = (() => {
      if (event.getModifierState("Control")) {
        return 1;
      }

      if (event.getModifierState("Shift")) {
        return 10;
      }

      return frameLength;
    })();

    console.log(distance * value);

    onClick(distance * value);
  }

  return <IconButton icon={Icon} aria-label="Step backwards" onClick={handleClick} />;
}
