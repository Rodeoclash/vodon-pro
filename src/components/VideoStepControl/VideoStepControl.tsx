import { useState, useLayoutEffect } from "react";
import { IconButton } from "@chakra-ui/react";

import {
  PlayerTrackPrev as PlayerTrackPrevIcon,
  PlayerTrackNext as PlayerTrackNextIcon,
} from "tabler-icons-react";

interface Props {
  direction: "forwards" | "backwards";
  frameRate: number;
  onClick: (value: number) => void;
}

export default function VideoStepControl({
  onClick,
  frameRate,
  direction,
}: Props) {
  const [mouseDown, setMouseDown] = useState(false);
  const [value, Icon] =
    direction === "forwards"
      ? [1, <PlayerTrackNextIcon />]
      : [-1, <PlayerTrackPrevIcon />];
  const frameLength = 1 / frameRate;

  useLayoutEffect(() => {
    if (mouseDown === true) {
      onClick(frameLength * value);
    }

    const interval = setInterval(() => {
      if (mouseDown === true) {
        onClick(frameLength * value);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [mouseDown]);

  function handleMouseDown() {
    setMouseDown(true);
  }

  function handleMouseUp() {
    setMouseDown(false);
  }

  return (
    <IconButton
      icon={Icon}
      aria-label="Step backwards"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    />
  );
}
