import { useState, useEffect, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useBus } from 'react-bus';
import { GLOBAL_TIME_CHANGE } from '../../services/bus';

import useVideoStore from '../../services/stores/videos';
import useSettingsStore from '../../services/stores/settings';
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
  const bus = useBus();
  const setActiveVideoId = useVideoStore((state) => state.setActiveVideoId);
  const startPlaying = useVideoStore((state) => state.startPlaying);
  const stopPlaying = useVideoStore((state) => state.stopPlaying);
  const setCurrentTime = useVideoStore((state) => state.setCurrentTime);
  const setOverrideHideControls = useVideoStore(
    (state) => state.setOverrideHideControls
  );

  const currentTime = useVideoStore((state) => state.currentTime);
  const playing = useVideoStore((state) => state.playing);
  const videos = useVideoStore((state) => state.videos);

  const arrowKeyJumpDistance = useSettingsStore(
    (state) => state.arrowKeyJumpDistance
  );
  const setZoomPan = useSettingsStore((state) => state.setZoomPan);

  const parsedArrowKeyJumpDistance = parseFloat(arrowKeyJumpDistance);

  const [previousFrameHeld, setPreviousFrameHeld] = useState(false);
  const [nextFrameHeld, setNextFrameHeld] = useState(false);

  const videoOffset = video.offset ? video.offset : 0;

  /**
   * Handle going back by a frame
   */
  const handlePreviousFrame = useCallback(() => {
    if (!video.el) {
      return;
    }

    stopPlaying();

    const time = video.el.currentTime - 1 / video.frameRate + videoOffset;

    bus.emit(GLOBAL_TIME_CHANGE, { time });
    setCurrentTime(time); // REMOVE ONCE GLOBAL TIME UPDATED
  }, [setCurrentTime, video, stopPlaying, bus, videoOffset]);

  /**
   * Handle going back by a jump
   */
  const handlePreviousJump = useCallback(() => {
    if (!video.el) {
      return;
    }

    stopPlaying();

    const time =
      video.el.currentTime - parsedArrowKeyJumpDistance + videoOffset;

    bus.emit(GLOBAL_TIME_CHANGE, { time });
    setCurrentTime(time); // REMOVE ONCE GLOBAL TIME UPDATED
  }, [
    setCurrentTime,
    video,
    stopPlaying,
    bus,
    videoOffset,
    parsedArrowKeyJumpDistance,
  ]);

  /**
   * Handle going foward by a frame
   */
  const handleNextFrame = useCallback(() => {
    if (!video.el) {
      return;
    }

    stopPlaying();

    const time = video.el.currentTime + 1 / video.frameRate + videoOffset;

    bus.emit(GLOBAL_TIME_CHANGE, { time });
    setCurrentTime(time); // REMOVE ONCE GLOBAL TIME UPDATED
  }, [setCurrentTime, video, stopPlaying, bus, videoOffset]);

  /**
   * Handle going forward by a jump
   */
  const handleNextJump = useCallback(() => {
    if (!video.el) {
      return;
    }

    stopPlaying();

    const time =
      video.el.currentTime + parsedArrowKeyJumpDistance + videoOffset;

    bus.emit(GLOBAL_TIME_CHANGE, { time });
    setCurrentTime(time); // REMOVE ONCE GLOBAL TIME UPDATED
  }, [
    setCurrentTime,
    video,
    stopPlaying,
    bus,
    videoOffset,
    parsedArrowKeyJumpDistance,
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
      if (previousFrameHeld === true && nextFrameHeld === false) {
        handlePreviousFrame();
      }

      if (nextFrameHeld === true && previousFrameHeld === false) {
        handleNextFrame();
      }
    }, STEP_ADVANCE_INTERVAL);

    return () => {
      clearTimeout(interval);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, previousFrameHeld, nextFrameHeld]);

  /**
   * Previous frame held down
   */
  useHotkeys(
    'left, a',
    () => {
      if (previousFrameHeld === true) {
        return;
      }
      handlePreviousFrame();
      setPreviousFrameHeld(true);
    },
    {
      keydown: true,
    },
    [previousFrameHeld, currentTime]
  );

  /**
   * Previous frame released
   */
  useHotkeys(
    'left, a',
    () => {
      setPreviousFrameHeld(false);
    },
    {
      keyup: true,
    },
    []
  );

  /**
   * Next frame held down
   */
  useHotkeys(
    'right, d',
    () => {
      if (nextFrameHeld === true) {
        return;
      }

      handleNextFrame();
      setNextFrameHeld(true);
    },
    {
      keydown: true,
    },
    [nextFrameHeld, currentTime]
  );

  /**
   * Next frame released
   */
  useHotkeys(
    'right, d',
    () => {
      setNextFrameHeld(false);
    },
    {
      keyup: true,
    },
    []
  );

  /**
   * Zoom pan held down
   */
  useHotkeys(
    'z',
    () => {
      setZoomPan(true);
    },
    {
      keydown: true,
    },
    [nextFrameHeld, currentTime]
  );

  /**
   * Zoom pan released
   */
  useHotkeys(
    'z',
    () => {
      setZoomPan(false);
    },
    {
      keyup: true,
    },
    []
  );

  /**
   * Jump previous pressed
   */
  useHotkeys(
    'down, s',
    () => {
      handlePreviousJump();
    },
    {},
    []
  );

  /**
   * Jump next pressed
   */
  useHotkeys(
    'up, w',
    () => {
      handleNextJump();
    },
    {},
    []
  );

  /**
   * Switch between videos
   */
  useHotkeys(
    '1,2,3,4,5,6,7,8,9',
    (arg1) => {
      const index = parseInt(arg1.key, 10) - 1;
      if (videos[index] !== undefined) {
        setActiveVideoId(videos[index].id);
      }
    },
    {},
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

  /**
   * Holding H
   */
  useHotkeys(
    'h',
    () => {
      setOverrideHideControls(true);
    },
    {
      keydown: true,
    },
    [previousFrameHeld, currentTime]
  );

  /**
   * Let go of H
   */
  useHotkeys(
    'h',
    () => {
      setOverrideHideControls(false);
    },
    {
      keyup: true,
    },
    [previousFrameHeld, currentTime]
  );

  return <></>;
}
