import { useState, useEffect, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import useVideoStore from '../../services/stores/videos';
import useSettingsStore, {
  ArrowKeyNavigationMode,
} from '../../services/stores/settings';
import { STEP_ADVANCE_INTERVAL } from '../../services/ui';

import type { Video } from '../../services/models/Video';

type Props = {
  onEscape: () => void;
  video: Video;
};

export default function HotKeys({
  onEscape,
  video,
}: Props): React.ReactElement {
  const startPlaying = useVideoStore((state) => state.startPlaying);
  const stopPlaying = useVideoStore((state) => state.stopPlaying);
  const setCurrentTime = useVideoStore((state) => state.setCurrentTime);
  const currentTime = useVideoStore((state) => state.currentTime);
  const playing = useVideoStore((state) => state.playing);

  const arrowKeyJumpDistance = useSettingsStore(
    (state) => state.arrowKeyJumpDistance
  );

  const parsedArrowKeyJumpDistance = parseFloat(arrowKeyJumpDistance);

  const arrowKeyNavigationMode = useSettingsStore(
    (state) => state.arrowKeyNavigationMode
  );

  const [previousHeld, setPreviousHeld] = useState(false);
  const [nextHeld, setNextHeld] = useState(false);

  const handlePrevious = useCallback(() => {
    const updatedCurrentTime =
      arrowKeyNavigationMode === ArrowKeyNavigationMode.frame
        ? useVideoStore.getState().currentTime - 1 / video.frameRate
        : useVideoStore.getState().currentTime - parsedArrowKeyJumpDistance;

    setCurrentTime(updatedCurrentTime);
  }, [
    setCurrentTime,
    video,
    parsedArrowKeyJumpDistance,
    arrowKeyNavigationMode,
  ]);

  const handleNext = useCallback(() => {
    const updatedCurrentTime =
      arrowKeyNavigationMode === ArrowKeyNavigationMode.frame
        ? useVideoStore.getState().currentTime + 1 / video.frameRate
        : useVideoStore.getState().currentTime + parsedArrowKeyJumpDistance;

    setCurrentTime(updatedCurrentTime);
  }, [
    setCurrentTime,
    video,
    parsedArrowKeyJumpDistance,
    arrowKeyNavigationMode,
  ]);

  /**
   * Handle the effects of the keys being held down. We ignore any frame
   * navigation keys being held when the video is playing otherwise we'll be
   * fighting against the playback of the video.
   */
  useEffect(() => {
    if (playing === true) {
      return undefined;
    }

    const interval = setInterval(() => {
      if (previousHeld === true && nextHeld === false) {
        handlePrevious();
      }

      if (nextHeld === true && previousHeld === false) {
        handleNext();
      }
    }, STEP_ADVANCE_INTERVAL);

    return () => {
      clearTimeout(interval);
    };
  }, [playing, previousHeld, nextHeld, handlePrevious, handleNext]);

  /**
   * Previous frame control held down
   */
  useHotkeys(
    'left, a',
    () => {
      if (previousHeld === true) {
        return;
      }
      handlePrevious();
      setPreviousHeld(true);
    },
    {
      keydown: true,
    },
    [previousHeld, currentTime]
  );

  /**
   * Previous frame control released
   */
  useHotkeys(
    'left, a',
    () => {
      setPreviousHeld(false);
    },
    {
      keyup: true,
    },
    []
  );

  /**
   * Next frame control held down
   */
  useHotkeys(
    'right, d',
    () => {
      if (nextHeld === true) {
        return;
      }

      handleNext();
      setNextHeld(true);
    },
    {
      keydown: true,
    },
    [nextHeld, currentTime]
  );

  /**
   * Next frame control released
   */
  useHotkeys(
    'right, d',
    () => {
      setNextHeld(false);
    },
    {
      keyup: true,
    },
    []
  );

  /**
   * Listen to the escape key being pressed when exiting the fullscreen player.
   * Used to set the fullscreen state back to false on the review page.
   */
  useHotkeys(
    'escape',
    () => {
      onEscape();
    },
    {},
    []
  );

  /**
   * Toggle playing the videos by using spacebar.
   */
  useHotkeys(
    'space',
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

  return null;
}
