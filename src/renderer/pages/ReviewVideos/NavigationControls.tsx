import { Box, Flex, IconButton, Tooltip } from '@chakra-ui/react';
import type { TldrawApp } from '@tldraw/tldraw';
import type { RefObject } from 'react';
import {
  Maximize as MaximizeIcon,
  PlayerPause as PlayerPauseIcon,
  PlayerPlay as PlayerPlayIcon,
} from 'tabler-icons-react';
import GlobalTimeControl from '../../components/GlobalTimeControl/GlobalTimeControl';
import GlobalTimeDisplay from '../../components/GlobalTimeDisplay/GlobalTimeDisplay';
import PlaybackSpeed from '../../components/PlaybackSpeed/PlaybackSpeed';
import VideoBookmarkAdd from '../../components/VideoBookmarkAdd/VideoBookmarkAdd';
import VideoStepControl from '../../components/VideoStepControl/VideoStepControl';
import VideoVolume from '../../components/VideoVolume/VideoVolume';
import type { Video } from '../../services/models/Video';
import useVideoStore from '../../services/stores/videos';
import type { PreciseVideoTimes } from '../ReviewVideos';

type Props = {
  /** The drawing app, once it has mounted; bookmarks need it. */
  app: TldrawApp | undefined;
  /** Whether the active video already has a bookmark showing. */
  hasActiveBookmark: boolean;
  isAfterRange: boolean;
  onHoverChange: (hovering: boolean) => void;
  onStep: (distance: number) => void;
  onToggleFullscreen: () => void;
  fullscreenTriggerRef: RefObject<HTMLButtonElement>;
  scale: number;
  video: Video;
  videoTimes: PreciseVideoTimes;
};

/**
 * The control bar along the bottom of the active video.
 */
export default function NavigationControls({
  app,
  hasActiveBookmark,
  isAfterRange,
  onHoverChange,
  onStep,
  onToggleFullscreen,
  fullscreenTriggerRef,
  scale,
  video,
  videoTimes,
}: Props) {
  const playing = useVideoStore((state) => state.playing);
  const startPlaying = useVideoStore((state) => state.startPlaying);
  const stopPlaying = useVideoStore((state) => state.stopPlaying);
  const editingBookmark = useVideoStore((state) => state.editingBookmark);

  return (
    <Flex
      align="center"
      bottom={0}
      boxSizing="border-box"
      justify="center"
      left={0}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      position="absolute"
      right={0}
      zIndex={2}
    >
      <Flex
        align="center"
        background="gray.900"
        borderBottom="none"
        borderColor="whiteAlpha.500"
        borderWidth="1px"
        minWidth="50vw"
        p={4}
        pointerEvents="all"
      >
        <Tooltip label={playing ? 'Pause' : 'Play'}>
          <Box mr="2">
            {playing ? (
              <IconButton
                onClick={stopPlaying}
                icon={<PlayerPauseIcon />}
                aria-label="Pause"
              />
            ) : (
              <IconButton
                onClick={startPlaying}
                icon={<PlayerPlayIcon />}
                aria-label="Play"
                disabled={isAfterRange}
              />
            )}
          </Box>
        </Tooltip>

        <Box mx={2}>
          <PlaybackSpeed disabled={playing} />
        </Box>

        <Box mx="2">
          <VideoStepControl
            direction="backwards"
            frameRate={video.frameRate}
            onClick={onStep}
            pause={video.seeking}
          />
        </Box>

        <Box mx="2">
          <GlobalTimeDisplay />
        </Box>

        <Box flexGrow={1} mx="2" minW="25vw">
          <GlobalTimeControl video={video} />
        </Box>

        <Box mx="2">
          <VideoVolume video={video} />
        </Box>

        <Box mx="2">
          <VideoStepControl
            direction="forwards"
            frameRate={video.frameRate}
            onClick={onStep}
            pause={video.seeking}
          />
        </Box>

        {app && (
          <Box mx="2">
            <VideoBookmarkAdd
              key={video.id}
              app={app}
              disabled={hasActiveBookmark || editingBookmark || isAfterRange}
              scale={scale}
              video={video}
              videoTimes={videoTimes}
            />
          </Box>
        )}

        <Tooltip label="Presentation mode">
          <Box ml="2">
            <IconButton
              onClick={onToggleFullscreen}
              icon={<MaximizeIcon />}
              aria-label="Fullscreen video"
              disabled={isAfterRange}
              ref={fullscreenTriggerRef}
            />
          </Box>
        </Tooltip>
      </Flex>
    </Flex>
  );
}
