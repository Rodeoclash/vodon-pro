import * as React from "react";

import useStore from "../../services/store";
import { truncateString } from "../../services/text";

import { Box, Tooltip } from "@chakra-ui/react";

import { Bookmark as BookmarkIcon } from "tabler-icons-react";

import type { Video } from "../../services/models/Video";
import type { VideoBookmark } from "../../services/models/VideoBookmark";

type Props = {
  bookmark: VideoBookmark;
  video: Video;
};

export default function VideoBookmarkTimeline({ bookmark }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const setCurrentTime = useStore((state) => state.setCurrentTime);

  function handleGoto() {
    setCurrentTime(bookmark.time);
    setIsOpen(false);
  }

  return (
    <Tooltip label={truncateString(bookmark.content, 50)}>
      <Box onClick={handleGoto} cursor="pointer">
        <BookmarkIcon />
      </Box>
    </Tooltip>
  );
}
