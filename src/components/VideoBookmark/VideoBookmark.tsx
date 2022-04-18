import { css } from "@emotion/react";

import useStore from "../../services/store";

import { Box, Flex, Button, ButtonGroup, Text } from "@chakra-ui/react";
import Draggable from "react-draggable"; // The default

import VideoBookmarkForm from "../VideoBookmarkForm/VideoBookmarkForm";

import type { Video } from "../../services/models/Video";
import type { VideoBookmark } from "../../services/models/VideoBookmark";

type Props = {
  bookmark: VideoBookmark;
  scale: number;
  video: Video;
};

const dragHandleStyles = css`
  cursor: move;
  height: 2rem;
  background: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.05) 10px,
    rgba(255, 255, 255, 0.1) 10px,
    rgba(255, 255, 255, 0.1) 20px
  );
`;

export default function VideoBookmark({ video, bookmark, scale }: Props) {
  const playing = useStore((state) => state.playing);
  const editingBookmark = useStore((state) => state.editingBookmark);

  const deleteVideoBookmark = useStore((state) => state.deleteVideoBookmark);
  const startEditingBookmark = useStore((state) => state.startEditingBookmark);
  const stopEditingBookmark = useStore((state) => state.stopEditingBookmark);

  const setVideoBookmarkCoords = useStore(
    (state) => state.setVideoBookmarkCoords
  );

  const setVideoBookmarkContent = useStore(
    (state) => state.setVideoBookmarkContent
  );

  if (playing === true) {
    return null;
  }

  if (!bookmark) {
    return null;
  }

  function handleDelete() {
    deleteVideoBookmark(video, bookmark);
    stopEditingBookmark();
  }

  function handleEdit() {
    startEditingBookmark();
  }

  function handleDone() {
    stopEditingBookmark();
  }

  function handleDragStop(e: MouseEvent, data: { x: number; y: number }) {
    setVideoBookmarkCoords(video, bookmark, { x: data.x, y: data.y }, scale);
  }

  function handleContentUpdate(content: string) {
    setVideoBookmarkContent(video, bookmark, content);
  }

  const offset = scale / bookmark.scale;

  const position = bookmark.position
    ? { x: bookmark.position.x * offset, y: bookmark.position.y * offset }
    : null;

  const renderedContent = editingBookmark ? (
    <VideoBookmarkForm onChange={handleContentUpdate} bookmark={bookmark} />
  ) : (
    <Text>{bookmark.content}</Text>
  );

  const renderedPositiveAction = editingBookmark ? (
    <Button onClick={handleDone}>Done</Button>
  ) : (
    <Button onClick={handleEdit}>Edit</Button>
  );

  return (
    <Flex
      position={"absolute"}
      left={0}
      top={0}
      right={0}
      bottom={0}
      align={"flex-end"}
      justify={"flex-end"}
      padding="4"
      pointerEvents={"none"}
      zIndex={3}
    >
      <Draggable
        key={bookmark.id}
        onStop={handleDragStop}
        bounds={"parent"}
        handle="#dragHandle"
        position={position}
      >
        <Box pointerEvents={"all"} background={"blackAlpha.900"} width={"md"}>
          <Box id="dragHandle" css={dragHandleStyles} />
          <Box padding={"4"} borderBottom="1px" borderColor={"whiteAlpha.500"}>
            {renderedContent}
          </Box>
          <Flex padding={"4"} justifyContent="flex-end">
            <ButtonGroup size="sm">
              <Button onClick={handleDelete} colorScheme="red">
                Delete
              </Button>
              {renderedPositiveAction}
            </ButtonGroup>
          </Flex>
        </Box>
      </Draggable>
    </Flex>
  );
}
