import { useEffect } from 'react';

import { TldrawApp } from '@tldraw/tldraw';

import { Box, IconButton, Tooltip } from '@chakra-ui/react';

import { Bookmark as BookmarkIcon } from 'tabler-icons-react';
import type { PreciseVideoTimes } from 'renderer/pages/ReviewVideos';
import useStore from '../../services/stores/videos';

import type { Video } from '../../services/models/Video';

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
   * When the current time changes, stop editing any open bookmarks.
   */
  useEffect(() => {
    stopEditingBookmark();
  }, [video.el.currentTime, stopEditingBookmark]);

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
