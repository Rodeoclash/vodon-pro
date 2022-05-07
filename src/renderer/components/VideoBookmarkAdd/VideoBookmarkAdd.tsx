import { useEffect } from 'react';

import { TldrawApp } from '@tldraw/tldraw';

import { Box, IconButton, Tooltip } from '@chakra-ui/react';

import { Bookmark as BookmarkIcon } from 'tabler-icons-react';
import useStore from '../../services/stores/videos';

import type { Video } from '../../services/models/Video';

type Props = {
  app: TldrawApp;
  scale: number;
  video: Video;
  disabled: boolean;
};

export default function VideoBookmark({ video, scale, disabled, app }: Props) {
  const createVideoBookmark = useStore((state) => state.createVideoBookmark);
  const stopPlaying = useStore((state) => state.stopPlaying);
  const startEditingBookmark = useStore((state) => state.startEditingBookmark);
  const stopEditingBookmark = useStore((state) => state.stopEditingBookmark);

  const currentTime = useStore((state) => state.currentTime);

  function handleCreate() {
    stopPlaying();
    createVideoBookmark(video, '', currentTime, scale, app.document);
    startEditingBookmark();
  }

  useEffect(() => {
    stopEditingBookmark();
  }, [currentTime, stopEditingBookmark]);

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
