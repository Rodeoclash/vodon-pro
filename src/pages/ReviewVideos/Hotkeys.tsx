import { useHotkeys } from "react-hotkeys-hook";

import useStore from "../../services/store";

import type { Video } from "../../services/models/Video";

type Props = {
  onEscape: () => void;
  video: Video;
};

export default function HotKeys({
  onEscape,
  video,
}: Props): React.ReactElement {
  const startPlaying = useStore((state) => state.startPlaying);
  const stopPlaying = useStore((state) => state.stopPlaying);
  const setCurrentTime = useStore((state) => state.setCurrentTime);

  const currentTime = useStore((state) => state.currentTime);
  const playing = useStore((state) => state.playing);

  // spacebar starts / stop play
  useHotkeys(
    "space",
    () => {
      if (playing === true) {
        stopPlaying();
      } else {
        startPlaying();
      }
    },
    {},
    [playing]
  );

  useHotkeys(
    "left, a",
    () => {
      if (playing === true) {
        return;
      }
      setCurrentTime(currentTime - 1 / video.frameRate);
    },
    {},
    [playing, currentTime, video]
  );

  useHotkeys(
    "right, d",
    () => {
      if (playing === true) {
        return;
      }
      setCurrentTime(currentTime + 1 / video.frameRate);
    },
    {},
    [playing, currentTime, video]
  );

  useHotkeys(
    "escape",
    () => {
      onEscape();
    },
    {},
    []
  );

  return null;
}
