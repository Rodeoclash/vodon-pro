import { Box, IconButton, Tooltip } from '@chakra-ui/react';

import type { TldrawApp } from '@tldraw/tldraw';
import { useEffect, useRef } from 'react';
import { Bookmark as BookmarkIcon } from 'tabler-icons-react';
import type { PreciseVideoTimes } from '../../pages/ReviewVideos';
import type { Video } from '../../services/models/Video';
import useStore from '../../services/stores/videos';

type Props = {
  app: TldrawApp;
  disabled: boolean;
  scale: number;
  video: Video;
  videoTimes: PreciseVideoTimes;
};

export default function VideoBookmark({
  app,
  disabled,
  scale,
  video,
  videoTimes,
}: Props) {
  const createVideoBookmark = useStore((state) => state.createVideoBookmark);
  const stopPlaying = useStore((state) => state.stopPlaying);
  const startEditingBookmark = useStore((state) => state.startEditingBookmark);
  const stopEditingBookmark = useStore((state) => state.stopEditingBookmark);

  const setCurrentTime = useStore((state) => state.setCurrentTime);

  function handleCreate() {
    const time = Object.values(videoTimes)[0];
    stopPlaying();
    createVideoBookmark(video, '', time, scale, app.document);
    setCurrentTime(time);
    startEditingBookmark();
  }

  /**
   * When the video has moved since the last render, stop editing any open
   * bookmarks. The element's time isn't React state, so compare it by hand.
   */
  const lastTime = useRef<number>();
  useEffect(() => {
    const time = video.el.currentTime;
    if (time === lastTime.current) return;
    lastTime.current = time;
    stopEditingBookmark();
  });

  return (
    <Tooltip label="Bookmark this moment">
      <Box>
        <IconButton
          onClick={() => handleCreate()}
          icon={<BookmarkIcon />}
          aria-label="Bookmark this moment"
          disabled={disabled}
        />
      </Box>
    </Tooltip>
  );
}
