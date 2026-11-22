import { Box, Tooltip } from '@chakra-ui/react';
import { useBus } from 'react-bus';
import { Bookmark as BookmarkIcon } from 'tabler-icons-react';
import { GLOBAL_TIME_CHANGE } from '../../services/bus';
import type { Video } from '../../services/models/Video';
import type { VideoBookmark } from '../../services/models/VideoBookmark';
import useStore from '../../services/stores/videos';
import { truncateString } from '../../services/text';

type Props = {
  bookmark: VideoBookmark;
  video: Video;
  size: 'small' | 'medium';
};

export default function VideoBookmarkTimeline({
  video,
  bookmark,
  size = 'medium',
}: Props) {
  const bus = useBus();
  const setCurrentTime = useStore((state) => state.setCurrentTime);
  const setActiveVideoId = useStore((state) => state.setActiveVideoId);
  const stopPlaying = useStore((state) => state.stopPlaying);

  function handleGoto() {
    stopPlaying();
    setActiveVideoId(video.id);
    setCurrentTime(bookmark.time);
    bus.emit(GLOBAL_TIME_CHANGE, { time: bookmark.time });
  }

  const renderedIcon = (() => {
    if (bookmark.icon) {
      return bookmark.icon.native;
    }

    return (
      <BookmarkIcon
        size={size === 'medium' ? 25 : 20}
        color={size === 'medium' ? '#eee' : '#999'}
      />
    );
  })();

  return (
    <Tooltip label={`${video.name}: ${truncateString(bookmark.content, 50)}`}>
      <Box onClick={() => handleGoto()} cursor="pointer">
        {renderedIcon}
      </Box>
    </Tooltip>
  );
}
