import React, { useEffect, useRef } from "react";
import { css } from "@emotion/react";

import useStore from "../../services/store";

import { Box, Heading, Flex, Button, Center } from "@chakra-ui/react";
import { Refresh as RefreshIcon, Settings as SettingsIcon } from "tabler-icons-react";

import type { Video } from "../../services/store";

interface Props {
  video: Video;
}

export default function Video({ video }: Props) {
  const videoRef = useRef(null);

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

  // watch playing state and play / pause as needed
  useEffect(() => {
    if (playing === true) {
      video.el.play();
    } else {
      video.el.pause();
    }
  }, [playing]);

  const videoStyles = css`
    display: ${currentActive ? "none" : "block"};
    z-index: 0;
  `;

  const resetStyles = css`
    aspect-ratio: 16 / 9;
    display: ${currentActive ? "flex" : "none"};
    z-index: 0;
  `;

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
      <div css={videoStyles} onClick={handleClickVideo} ref={videoRef} />
      <Flex css={resetStyles} onClick={handleClickVideo} align={"center"} justify={"center"} bgColor={"gray.700"}>
        <Button onClick={handleClickReset} leftIcon={<RefreshIcon />}>
          Reset
        </Button>
      </Flex>
    </Box>
  );
}
