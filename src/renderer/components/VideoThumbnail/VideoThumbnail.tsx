import {
  useEffect,
  useRef,
  useLayoutEffect,
  useState,
  useCallback,
} from 'react';
import { useListener } from 'react-bus';
import { css } from '@emotion/react';
import { Box, Heading, Flex, Text } from '@chakra-ui/react';
import { GLOBAL_TIME_CHANGE } from '../../services/bus';

import useVideoStore from '../../services/stores/videos';
import { getRatioDimensions } from '../../services/layout';

import type { Video } from '../../services/models/Video';

interface Props {
  video: Video;
}

export default function VideoThumbnail({ video }: Props) {
  const videoRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef(null);

  const setActiveVideoId = useVideoStore((state) => state.setActiveVideoId);
  const setSeeking = useVideoStore((state) => state.setSeeking);

  const activeVideoId = useVideoStore((state) => state.activeVideoId);
  const currentTime = useVideoStore((state) => state.currentTime);
  const playbackSpeed = useVideoStore((state) => state.playbackSpeed);
  const playing = useVideoStore((state) => state.playing);

  const [videoDimensions, setVideoDimensions] = useState<
    [number, number] | null
  >(null);

  const isAfterRange =
    video.durationNormalised === null
      ? false
      : currentTime >= video.durationNormalised;

  const currentActive = activeVideoId === video.id;

  /**
   * Clicking the video makes it active.
   */
  function handleClickVideo() {
    setActiveVideoId(video.id);
  }

  /**
   * Actions that run once when the video is loaded. This is useful for setting event listeners on the video object.
   */
  useEffect(() => {
    if (video.el === null) {
      return undefined;
    }

    const handleLoadedMetaData = () => {
      if (containerRef.current === null || video.el === null) {
        return;
      }

      video.el.currentTime = currentTime - (video.offset || 0);
      window.dispatchEvent(new Event('resize'));
    };

    const handleSeeking = () => {
      if (containerRef.current === null) {
        return;
      }

      setSeeking(video, true);
    };

    const handleSeeked = () => {
      if (containerRef.current === null) {
        return;
      }

      setSeeking(video, false);
    };

    video.el.addEventListener('loadedmetadata', handleLoadedMetaData);
    video.el.addEventListener('seeking', handleSeeking);
    video.el.addEventListener('seeked', handleSeeked);

    return () => {
      if (video.el === null) {
        return;
      }

      video.el.removeEventListener('loadedmetadata', handleLoadedMetaData);
      video.el.removeEventListener('seeking', handleSeeking);
      video.el.removeEventListener('seeked', handleSeeked);
    };
  }, [video, currentTime, setSeeking]);

  // when this video becomes inactive, replace it in the list
  useEffect(() => {
    if (videoRef.current === null || video.el === null) {
      return;
    }

    if (currentActive === false) {
      videoRef.current.appendChild(video.el);
      video.el.volume = 0;
    }
  }, [video, currentActive]);

  // set volume on the active video
  useEffect(() => {
    if (currentActive === false || video.el === null) {
      return;
    }

    video.el.volume = video.volume;
  }, [currentActive, video]);

  // watch playing state and play / pause as needed
  useEffect(() => {
    if (video.el === null) {
      return;
    }

    if (playing === true) {
      video.el.play();
    } else {
      video.el.pause();
    }
  }, [video, playing]);

  /**
   * When global time updates are broadcast, listen to them here and set the
   * current time of the video as needed.
   */
  const handleGlobalTimeUpdate = useCallback(
    ({ time }) => {
      if (video.el === null || video.el.seeking === true) {
        return;
      }

      video.el.currentTime = time - (video.offset || 0);
    },
    [video]
  );

  useListener(GLOBAL_TIME_CHANGE, handleGlobalTimeUpdate);

  /**
   * As the video moves in and out of being active, we need to trigger resize
   * events to ensure it has space on the screen.
   */
  useLayoutEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [isAfterRange]);

  /**
   * As the video moves in and out of being active, we need to trigger resize
   * events to ensure it has space on the screen.
   */
  useLayoutEffect(() => {
    if (video.el === null) {
      return;
    }

    video.el.playbackRate = playbackSpeed;
  }, [playbackSpeed, video.el]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (containerRef.current === null) {
        return;
      }

      const dimensions = getRatioDimensions(
        video.displayAspectRatio,
        containerRef.current
      );

      setVideoDimensions(dimensions);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [video, currentActive]);

  const innerStyles = css`
    width: ${videoDimensions ? videoDimensions[0] : ''}px;
    height: ${videoDimensions ? videoDimensions[1] : ''}px;

    video {
      width: ${videoDimensions ? videoDimensions[0] : ''}px;
      height: ${videoDimensions ? videoDimensions[1] : ''}px;
    }
  `;

  const containerStyles = css`
    display: ${currentActive === true || isAfterRange === true
      ? 'none'
      : 'flex'};
  `;

  const afterRangeStyles = css`
    display: ${currentActive === false && isAfterRange === true
      ? 'flex'
      : 'none'};
  `;

  const afterRangeInnerStyles = css`
    aspect-ratio: ${video.displayAspectRatio.replace(':', '/')};
  `;

  if (!video || !video.durationNormalised) {
    return null;
  }

  return (
    <>
      <Flex
        align="center"
        css={containerStyles}
        height="100%"
        justifyContent="center"
        overflow="hidden"
        ref={containerRef}
      >
        <Box position="relative" cursor="pointer" css={innerStyles}>
          <Heading
            position="absolute"
            top="0"
            left="0"
            bgColor="blackAlpha.800"
            padding="2"
            fontSize="md"
            fontWeight="normal"
          >
            {video.name}
          </Heading>
          <Box onClick={() => handleClickVideo()} ref={videoRef} />
        </Box>
      </Flex>
      <Flex
        css={afterRangeStyles}
        height="100%"
        align="center"
        justifyContent="center"
      >
        <Flex
          css={afterRangeInnerStyles}
          bgColor="gray.700"
          width="100%"
          align="center"
          justifyContent="center"
        >
          <Text fontSize="sm">
            Finished{' '}
            {Math.round(Math.abs(video.durationNormalised - currentTime))}s ago
          </Text>
        </Flex>
      </Flex>
    </>
  );
}
