import React, { Component, useEffect, useRef, useState, useLayoutEffect } from "react";
import useStore from "../../services/store";

import { Box, Heading, Flex, Button, Center } from "@chakra-ui/react";
import { Refresh as RefreshIcon, Settings as SettingsIcon } from "tabler-icons-react";

import type { Video } from "../../services/store";

interface Props {
  video: Video;
}

export default function Video({ video }: Props) {
  const videoRef = useRef(null);
  const [dimensions, setDimensions] = useState(null);

  const activeVideoId = useStore((state) => state.activeVideoId);
  const playing = useStore((state) => state.playing);
  const setActiveVideoId = useStore((state) => state.setActiveVideoId);

  const currentActive = activeVideoId === video.id;

  function handleClickName(event: React.SyntheticEvent<EventTarget>) {
    event.stopPropagation();
  }

  function handleClickVideo(event: React.SyntheticEvent<EventTarget>) {
    event.stopPropagation();
    setActiveVideoId(video.id);
  }

  function handleClickReset(event: React.SyntheticEvent<EventTarget>) {
    event.stopPropagation();
    setActiveVideoId(null);
  }

  function handleResize() {
    if (currentActive === true) {
      return;
    }

    setDimensions([video.el.offsetWidth, video.el.offsetHeight]);
  }

  function handleLoadedMetaData() {
    handleResize();
  }

  useEffect(() => {
    if (videoRef.current === null) {
      return;
    }

    if (currentActive === false) {
      videoRef.current.appendChild(video.el);
      video.el.volume = 0;
    }
  }, [currentActive]);

  // watch playing state
  useEffect(() => {
    if (playing === true) {
      video.el.play();
    } else {
      video.el.pause();
    }
  }, [playing]);

  // monitor aspect ratio of video for placeholder
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    video.el.addEventListener("loadedmetadata", handleLoadedMetaData);

    return function () {
      window.removeEventListener("resize", handleResize);
      video.el.removeEventListener("loadedmetadata", handleLoadedMetaData);
    };
  }, []);

  const renderedResetButton =
    dimensions === null ? null : (
      <Flex
        style={{ zIndex: 0, display: currentActive ? "flex" : "none" }}
        width={dimensions[0]}
        height={dimensions[1]}
        onClick={handleClickVideo}
        align={"center"}
        justify={"center"}
        bgColor={"gray.700"}
      >
        <Button onClick={handleClickReset} leftIcon={<RefreshIcon />}>
          Reset
        </Button>
      </Flex>
    );

  return (
    <Box position={"relative"}>
      <Flex
        onClick={handleClickName}
        align={"center"}
        position={"absolute"}
        top={"0"}
        left={"0"}
        p={"2"}
        cursor={"pointer"}
        zIndex={1}
        bgColor={"blackAlpha.600"}
      >
        <SettingsIcon />
        <Heading fontSize={"medium"} ml={"2"} fontWeight={"normal"} textDecoration={"underline"}>
          {video.name}
        </Heading>
      </Flex>
      <div style={{ zIndex: 0, display: currentActive ? "none" : "block" }} onClick={handleClickVideo} ref={videoRef} />
      {renderedResetButton}
    </Box>
  );
}
