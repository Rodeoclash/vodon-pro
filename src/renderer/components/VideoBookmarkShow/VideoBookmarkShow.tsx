import { css } from '@emotion/react';

import {
  Box,
  Flex,
  Button,
  ButtonGroup,
  Text,
  Spacer,
  IconButton,
} from '@chakra-ui/react';
import Draggable from 'react-draggable'; // The default
import {
  CaretLeft as CaretLeftIcon,
  CaretRight as CaretRightIcon,
} from 'tabler-icons-react';
import useVideoStore from '../../services/stores/videos';

import VideoBookmarkForm from '../VideoBookmarkForm/VideoBookmarkForm';
import {
  findNextBookmark,
  findPreviousBookmark,
} from '../../services/models/Video';

import type { Video } from '../../services/models/Video';
import type { VideoBookmark } from '../../services/models/VideoBookmark';

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

export default function VideoBookmarkShow({ video, bookmark, scale }: Props) {
  const playing = useVideoStore((state) => state.playing);
  const editingBookmark = useVideoStore((state) => state.editingBookmark);
  const videos = useVideoStore((state) => state.videos);

  const setActiveVideoId = useVideoStore((state) => state.setActiveVideoId);
  const setCurrentTime = useVideoStore((state) => state.setCurrentTime);

  const deleteVideoBookmark = useVideoStore(
    (state) => state.deleteVideoBookmark
  );

  const startEditingBookmark = useVideoStore(
    (state) => state.startEditingBookmark
  );

  const stopEditingBookmark = useVideoStore(
    (state) => state.stopEditingBookmark
  );

  const setVideoBookmarkCoords = useVideoStore(
    (state) => state.setVideoBookmarkCoords
  );

  const setVideoBookmarkContent = useVideoStore(
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

  const offset = scale / bookmark.scale;

  const position = bookmark.position
    ? { x: bookmark.position.x * offset, y: bookmark.position.y * offset }
    : undefined;

  const renderedContent = editingBookmark ? (
    <VideoBookmarkForm
      onChange={(content) => setVideoBookmarkContent(video, bookmark, content)}
      bookmark={bookmark}
    />
  ) : (
    <Text style={{ whiteSpace: 'pre-wrap' }}>{bookmark.content}</Text>
  );

  const renderedPositiveAction = editingBookmark ? (
    <Button onClick={() => stopEditingBookmark()}>Done</Button>
  ) : (
    <Button onClick={() => startEditingBookmark()}>Edit</Button>
  );

  const nextBookmark = findNextBookmark(videos, bookmark);
  const previousBookmark = findPreviousBookmark(videos, bookmark);

  const handleBookmarkNavigationClick = ([
    bookmarkNavigationVideo,
    bookmarkNavigationBookmark,
  ]: [Video, VideoBookmark]) => {
    setActiveVideoId(bookmarkNavigationVideo.id);
    setCurrentTime(bookmarkNavigationBookmark.time);
  };

  const renderedPreviousBookmarkLink = (() => {
    if (previousBookmark === undefined) {
      return null;
    }

    return (
      <IconButton
        icon={<CaretLeftIcon />}
        aria-label="Previous Bookmark"
        onClick={() => handleBookmarkNavigationClick(previousBookmark)}
      />
    );
  })();

  const renderedNextBookmarkLink = (() => {
    if (nextBookmark === undefined) {
      return null;
    }

    return (
      <IconButton
        icon={<CaretRightIcon />}
        aria-label="Previous Bookmark"
        onClick={() => handleBookmarkNavigationClick(nextBookmark)}
      />
    );
  })();

  return (
    <Flex
      position="absolute"
      left={0}
      top={0}
      right={0}
      bottom={0}
      align="flex-end"
      justify="flex-end"
      padding="4"
      pointerEvents="none"
      zIndex={3}
    >
      <Draggable
        key={bookmark.id}
        onStop={(_event, data) =>
          setVideoBookmarkCoords(
            video,
            bookmark,
            { x: data.x, y: data.y },
            scale
          )
        }
        bounds="parent"
        handle="#dragHandle"
        position={position}
      >
        <Box pointerEvents="all" background="blackAlpha.900" width="md">
          <Box id="dragHandle" css={dragHandleStyles} />
          <Box padding="4" borderBottom="1px" borderColor="whiteAlpha.500">
            {renderedContent}
          </Box>
          <Flex padding="4">
            {renderedPreviousBookmarkLink}
            <Spacer />
            <ButtonGroup size="sm">
              <Button onClick={() => handleDelete()} colorScheme="red">
                Delete
              </Button>
              {renderedPositiveAction}
            </ButtonGroup>
            <Spacer />
            {renderedNextBookmarkLink}
          </Flex>
        </Box>
      </Draggable>
    </Flex>
  );
}
