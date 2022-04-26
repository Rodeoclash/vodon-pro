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
  size: "small" | "medium";
};

export default function VideoBookmarkTimeline({
  video,
  bookmark,
  size = "medium",
}: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const setCurrentTime = useStore((state) => state.setCurrentTime);
  const setActiveVideoId = useStore((state) => state.setActiveVideoId);

  function handleGoto() {
    setActiveVideoId(video.id);
    setCurrentTime(bookmark.time);
    setIsOpen(false);
  }

  return (
    <Tooltip label={`${video.name}: ${truncateString(bookmark.content, 50)}`}>
      <Box onClick={handleGoto} cursor="pointer">
        <BookmarkIcon
          size={size === "medium" ? 25 : 20}
          color={size === "medium" ? "#eee" : "#999"}
        />
      </Box>
    </Tooltip>
  );
}
