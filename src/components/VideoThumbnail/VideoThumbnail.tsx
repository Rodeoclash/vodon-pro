import React, { useEffect, useRef, useLayoutEffect, useState } from "react";
import { css } from "@emotion/react";

import useStore from "../../services/store";
import { getRatioDimensions } from "../../services/layout";

import { Box, Heading, Flex, Button, Text } from "@chakra-ui/react";
import { Refresh as RefreshIcon } from "tabler-icons-react";

import type { Video } from "../../services/models/Video";

interface Props {
  video: Video;
}

export default function VideoThumbnail({ video }: Props) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const setActiveVideoId = useStore((state) => state.setActiveVideoId);

  const activeVideoId = useStore((state) => state.activeVideoId);
  const currentTime = useStore((state) => state.currentTime);
  const playing = useStore((state) => state.playing);
  const slowCPUMode = useStore((state) => state.slowCPUMode);

  const [videoDimensions, setVideoDimensions] = useState(null);

  const isAfterRange = currentTime > video.durationNormalised;
  const currentActive = activeVideoId === video.id;

  function handleClickVideo(event: React.SyntheticEvent<EventTarget>) {
    event.stopPropagation();
    setActiveVideoId(video.id);
  }

  function handleClickReset(event: React.SyntheticEvent<EventTarget>) {
    event.stopPropagation();
    setActiveVideoId(null);
  }

  useEffect(() => {
    const handleLoadedMetaData = () => {
      if (containerRef.current === null) {
        return;
      }

      window.dispatchEvent(new Event("resize"));
    };

    video.el.addEventListener("loadedmetadata", handleLoadedMetaData);

    return () => {
      video.el.removeEventListener("loadedmetadata", handleLoadedMetaData);
    };
  }, []);

  // when this video becomes inactive, replace it in the list
  useEffect(() => {
    if (videoRef.current === null) {
      return;
    }

    if (currentActive === false) {
      videoRef.current.appendChild(video.el);
      video.el.volume = 0; // TODO: Remove from this, control in store
    }
  }, [currentActive]);

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
    if (playing === false || (playing === true && currentActive === false && slowCPUMode === true)) {
      video.el.currentTime = currentTime + video.offsetNormalised;
    }
  }, [playing, currentTime, currentActive]);

  useLayoutEffect(() => {
    const handleFrame = (time: number, metadata: VideoFrameMetadata) => {
      // TODO: Is this better for tracking time elapsed?
      //console.log(time, metadata, metadata.mediaTime)
      //handleFrameAdvanced(metadata.mediaTime, getFramesFromSeconds(videoData.fps, metadata.mediaTime));
      video.el.requestVideoFrameCallback(handleFrame);
    };

    const id = video.el.requestVideoFrameCallback(handleFrame);

    return () => {
      video.el.cancelVideoFrameCallback(id);
    };
  }, [currentTime]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (containerRef.current === null) {
        return;
      }

      const dimensions = getRatioDimensions(video.displayAspectRatio, containerRef.current);

      setVideoDimensions(dimensions);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [currentActive]);

  const innerStyles = css`
    width: ${videoDimensions ? videoDimensions[0] : ""}px;
    height: ${videoDimensions ? videoDimensions[1] : ""}px;

    video {
      width: ${videoDimensions ? videoDimensions[0] : ""}px;
      height: ${videoDimensions ? videoDimensions[1] : ""}px;
    }
  `;

  const containerStyles = css`
    display: ${currentActive === true || isAfterRange === true ? "none" : "flex"};
  `;

  const afterRangeStyles = css`
    display: ${currentActive === false && isAfterRange === true ? "flex" : "none"};
  `;

  return (
    <Flex
      overflow={"hidden"}
      ref={containerRef}
      height="100%"
      css={containerStyles}
      align={"center"}
      justifyContent={"center"}
    >
      <Box position={"relative"} cursor={"pointer"} css={innerStyles}>
        <Heading
          position={"absolute"}
          top={"0"}
          left={"0"}
          bgColor={"blackAlpha.800"}
          padding={"2"}
          fontSize={"md"}
          fontWeight={"normal"}
        >
          {video.name}
        </Heading>
        <Box onClick={handleClickVideo} ref={videoRef} />
        <Flex css={afterRangeStyles} align={"center"} justify={"center"} bgColor={"gray.700"}>
          <Text fontSize={"sm"}>Finished {Math.round(Math.abs(video.durationNormalised - currentTime))}s ago</Text>
        </Flex>
      </Box>
    </Flex>
  );
}
