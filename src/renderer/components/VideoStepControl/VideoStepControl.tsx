import { useState, useEffect } from 'react';

import { IconButton, Tooltip } from '@chakra-ui/react';

import {
  PlayerTrackPrev as PlayerTrackPrevIcon,
  PlayerTrackNext as PlayerTrackNextIcon,
} from 'tabler-icons-react';
import { STEP_ADVANCE_INTERVAL } from '../../services/ui';

interface Props {
  direction: 'forwards' | 'backwards';
  frameRate: number;
  onClick: (value: number) => void;
  pause: boolean;
}

export default function VideoStepControl({
  onClick,
  frameRate,
  direction,
  pause,
}: Props) {
  const [mouseDown, setMouseDown] = useState(false);
  const [emitDistance, setEmitDistance] = useState<number | null>(null);

  const [value, Icon] =
    direction === 'forwards'
      ? [1, <PlayerTrackNextIcon />]
      : [-1, <PlayerTrackPrevIcon />];
  const frameLength = 1 / frameRate;

  useEffect(() => {
    if (emitDistance === null || pause === true) {
      return;
    }

    onClick(emitDistance);
    setEmitDistance(null);
  }, [emitDistance, onClick, pause]);

  useEffect(() => {
    if (mouseDown === true) {
      setEmitDistance(frameLength * value);
    }

    const interval = setInterval(() => {
      if (mouseDown === true) {
        setEmitDistance(frameLength * value);
      }
    }, STEP_ADVANCE_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [mouseDown, frameLength, value]);

  const label = `Frame ${direction} (hold for multiple steps)`;

  return (
    <Tooltip label={label}>
      <IconButton
        icon={Icon}
        aria-label={label}
        onMouseDown={() => setMouseDown(true)}
        onMouseUp={() => setMouseDown(false)}
      />
    </Tooltip>
  );
}
