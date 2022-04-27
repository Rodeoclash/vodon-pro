import { useState, useEffect } from 'react';
import { useHotkeys, isHotkeyPressed } from 'react-hotkeys-hook';

import useStore from '../../services/store';
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
  const startPlaying = useStore((state) => state.startPlaying);
  const stopPlaying = useStore((state) => state.stopPlaying);
  const setCurrentTime = useStore((state) => state.setCurrentTime);

  const currentTime = useStore((state) => state.currentTime);
  const playing = useStore((state) => state.playing);

  const [framePreviousHeld, setFramePreviousHeld] = useState(false);
  const [frameNextHeld, setFrameNextHeld] = useState(false);

  /**
   * Handle the effects of the keys being held down. We ignore any frame
   * navigation keys being held when the video is playing otherwise we'll be
   * fighting against the playback of the video.
   */
  useEffect(() => {
    if (playing === true) {
      return;
    }

    const interval = setInterval(() => {
      if (framePreviousHeld === true && frameNextHeld === false) {
        setCurrentTime(useStore.getState().currentTime - 1 / video.frameRate);
      }

      if (frameNextHeld === true && framePreviousHeld === false) {
        setCurrentTime(useStore.getState().currentTime + 1 / video.frameRate);
      }
    }, STEP_ADVANCE_INTERVAL);

    return () => {
      clearTimeout(interval);
    };
  }, [playing, framePreviousHeld, frameNextHeld]);

  /**
   * Previous frame control held down
   */
  useHotkeys(
    'left, a',
    () => {
      if (framePreviousHeld === true) {
        return;
      }
      setCurrentTime(currentTime - 1 / video.frameRate); // trigger an instant frameback
      setFramePreviousHeld(true);
    },
    {
      keydown: true,
    },
    [framePreviousHeld, currentTime]
  );

  /**
   * Previous frame control released
   */
  useHotkeys(
    'left, a',
    () => {
      setFramePreviousHeld(false);
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
      if (frameNextHeld === true) {
        return;
      }

      setCurrentTime(currentTime + 1 / video.frameRate); // trigger an instant frameback
      setFrameNextHeld(true);
    },
    {
      keydown: true,
    },
    [frameNextHeld, currentTime]
  );

  /**
   * Next frame control released
   */
  useHotkeys(
    'right, d',
    () => {
      setFrameNextHeld(false);
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
