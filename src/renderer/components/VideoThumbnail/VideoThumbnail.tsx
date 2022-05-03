import React, { useEffect, useRef, useLayoutEffect, useState } from 'react';
import { css } from '@emotion/react';

import { Box, Heading, Flex, Button, Text } from '@chakra-ui/react';
import useVideoStore from '../../services/stores/videos';
import useSettingsStore from '../../services/stores/settings';
import { getRatioDimensions } from '../../services/layout';

import type { Video } from '../../services/models/Video';

interface Props {
  video: Video;
}

export default function VideoThumbnail({ video }: Props) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const setActiveVideoId = useVideoStore((state) => state.setActiveVideoId);
  const activeVideoId = useVideoStore((state) => state.activeVideoId);
  const currentTime = useVideoStore((state) => state.currentTime);
  const playbackSpeed = useVideoStore((state) => state.playbackSpeed);
  const playing = useVideoStore((state) => state.playing);

  const slowCPUMode = useSettingsStore((state) => state.slowCPUMode);

  const [videoDimensions, setVideoDimensions] = useState(null);

  const isAfterRange = currentTime >= video.durationNormalised;

  const currentActive = activeVideoId === video.id;

  /**
   * Clicking the video makes it active.
   */
  function handleClickVideo(event: React.SyntheticEvent<EventTarget>) {
    setActiveVideoId(video.id);
  }

  /**
   * After the video has loaded, we need to trigger a resize event now that the
   * canvas is populated.
   */
  useEffect(() => {
    const handleLoadedMetaData = () => {
      if (containerRef.current === null) {
        return;
      }

      window.dispatchEvent(new Event('resize'));
    };

    video.el.addEventListener('loadedmetadata', handleLoadedMetaData);

    return () => {
      video.el.removeEventListener('loadedmetadata', handleLoadedMetaData);
    };
  }, []);

  // when this video becomes inactive, replace it in the list
  useEffect(() => {
    if (videoRef.current === null) {
      return;
    }

    if (currentActive === false) {
      videoRef.current.appendChild(video.el);
      video.el.volume = 0;
    }
  }, [currentActive]);

  // set volume on the active video
  useEffect(() => {
    if (currentActive === false) {
      return;
    }

    video.el.volume = video.volume;
  }, [currentActive, video]);

  // watch playing state and play / pause as needed
  useEffect(() => {
    if (playing === true && (currentActive === true || slowCPUMode === false)) {
      video.el.play();
    } else {
      video.el.pause();
    }
  }, [playing]);

  // watch current time and update as needed
  useEffect(() => {
    if (
      playing === false ||
      (playing === true && currentActive === false && slowCPUMode === true)
    ) {
      video.el.currentTime = currentTime - video.offset;
    }
  }, [playing, currentTime, currentActive]);

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
  }, [currentActive]);

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
    aspect-ratio: 16/9;
    display: ${currentActive === false && isAfterRange === true
      ? 'flex'
      : 'none'};
  `;

  return (
    <>
      <Flex
        overflow="hidden"
        ref={containerRef}
        height="100%"
        css={containerStyles}
        align="center"
        justifyContent="center"
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
          <Box onClick={handleClickVideo} ref={videoRef} />
        </Box>
      </Flex>
      <Flex
        css={afterRangeStyles}
        align="center"
        justify="center"
        bgColor="gray.700"
      >
        <Text fontSize="sm">
          Finished{' '}
          {Math.round(Math.abs(video.durationNormalised - currentTime))}s ago
        </Text>
      </Flex>
    </>
  );
}
