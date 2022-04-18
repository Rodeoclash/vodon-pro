import { useState } from "react";
import useStore from "../../services/store";

import { Box, IconButton, Tooltip } from "@chakra-ui/react";

import { Bookmark as BookmarkIcon } from "tabler-icons-react";

import type { Video } from "../../services/models/Video";

type Props = {
  scale: number;
  video: Video;
};

export default function VideoBookmark({ video, scale }: Props) {
  const createVideoBookmark = useStore((state) => state.createVideoBookmark);
  const stopPlaying = useStore((state) => state.stopPlaying);
  const startEditingBookmark = useStore((state) => state.startEditingBookmark);

  const currentTime = useStore((state) => state.currentTime);
  const editingBookmark = useStore((state) => state.editingBookmark);

  function handleCreate() {
    stopPlaying();
    createVideoBookmark(video, "", currentTime, scale);
    startEditingBookmark();
  }

  return (
    <Tooltip label="Bookmark this moment">
      <Box>
        <IconButton
          onClick={handleCreate}
          icon={<BookmarkIcon />}
          aria-label="Bookmark this moment"
          disabled={editingBookmark}
        />
      </Box>
    </Tooltip>
  );
}
