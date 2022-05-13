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

  /**
   * Handle going back by a frame
   */
  const handlePreviousFrame = useCallback(() => {
    stopPlaying();
    setCurrentTime(useVideoStore.getState().currentTime - 1 / video.frameRate);
  }, [setCurrentTime, video, stopPlaying]);

  /**
   * Handle going back by a jump
   */
  const handlePreviousJump = useCallback(() => {
    stopPlaying();
    setCurrentTime(
      useVideoStore.getState().currentTime - parsedArrowKeyJumpDistance
    );
  }, [setCurrentTime, parsedArrowKeyJumpDistance, stopPlaying]);

  /**
   * Handle going foward by a frame
   */
  const handleNextFrame = useCallback(() => {
    stopPlaying();
    setCurrentTime(useVideoStore.getState().currentTime + 1 / video.frameRate);
  }, [setCurrentTime, video, stopPlaying]);

  /**
   * Handle going forward by a jump
   */
  const handleNextJump = useCallback(() => {
    stopPlaying();
    setCurrentTime(
      useVideoStore.getState().currentTime + parsedArrowKeyJumpDistance
    );
  }, [setCurrentTime, parsedArrowKeyJumpDistance, stopPlaying]);

  /**
   * Perform a previous navigation when the modifier is not held
   */
  const handlePreviousMain = useCallback(() => {
    if (arrowKeyNavigationMode === ArrowKeyNavigationMode.frame) {
      handlePreviousFrame();
    } else {
      handlePreviousJump();
    }
  }, [handlePreviousFrame, handlePreviousJump, arrowKeyNavigationMode]);

  /**
   * Perform a previous navigation when the modifier is held
   */
  const handlePreviousModifier = useCallback(() => {
    if (arrowKeyNavigationMode === ArrowKeyNavigationMode.frame) {
      handlePreviousJump();
    } else {
      handlePreviousFrame();
    }
  }, [handlePreviousFrame, handlePreviousJump, arrowKeyNavigationMode]);

  /**
   * Perform a previous navigation when the modifier is not held
   */
  const handleNextMain = useCallback(() => {
    if (arrowKeyNavigationMode === ArrowKeyNavigationMode.frame) {
      handleNextFrame();
    } else {
      handleNextJump();
    }
  }, [handleNextFrame, handleNextJump, arrowKeyNavigationMode]);

  /**
   * Perform a previous navigation when the modifier is held
   */
  const handleNextModifier = useCallback(() => {
    if (arrowKeyNavigationMode === ArrowKeyNavigationMode.frame) {
      handleNextJump();
    } else {
      handleNextFrame();
    }
  }, [handleNextFrame, handleNextJump, arrowKeyNavigationMode]);

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
        handlePreviousMain();
      }

      if (nextHeld === true && previousHeld === false) {
        handleNextMain();
      }
    }, STEP_ADVANCE_INTERVAL);

    return () => {
      clearTimeout(interval);
    };
  }, [
    playing,
    previousHeld,
    nextHeld,
    handlePreviousMain,
    handlePreviousModifier,
    handleNextMain,
    handleNextModifier,
  ]);

  /**
   * Previous frame main held down
   */
  useHotkeys(
    'left, a',
    () => {
      if (previousHeld === true) {
        return;
      }
      handlePreviousMain();
      setPreviousHeld(true);
    },
    {
      keydown: true,
    },
    [previousHeld, currentTime]
  );

  /**
   * Previous frame main released
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
   * Previous frame modifier pressed
   */
  useHotkeys(
    'shift+left, shift+a',
    () => {
      if (previousHeld === true) {
        return;
      }
      handlePreviousModifier();
    },
    [previousHeld, currentTime]
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

      handleNextMain();
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
   * Next frame modifier pressed
   */
  useHotkeys(
    'shift+right, shift+d',
    () => {
      if (previousHeld === true) {
        return;
      }
      handleNextModifier();
    },
    [previousHeld, currentTime]
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

  return <></>;
}
