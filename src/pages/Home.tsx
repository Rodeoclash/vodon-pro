import React, { useRef, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import useStore from "../services/store";

import { Flex, Box, Text, ButtonGroup, IconButton } from "@chakra-ui/react";
import { PlayerPlay as PlayerPlayIcon, PlayerPause as PlayerPauseIcon } from "tabler-icons-react";

import VideoList from "../components/VideoList/VideoList";

export default function Home() {
  const videoRef = useRef(null);

  const startPlaying = useStore((state) => state.startPlaying);
  const stopPlaying = useStore((state) => state.stopPlaying);

  const activeVideoId = useStore((state) => state.activeVideoId);
  const playing = useStore((state) => state.playing);
  const videos = useStore((state) => state.videos);

  const activeVideo = videos.find((video) => {
    return activeVideoId === video.id;
  });

  useHotkeys(
    "space",
    () => {
      if (playing) {
        stopPlaying();
      } else {
        startPlaying();
      }
    },
    {},
    [playing]
  );

  // mount the active video into the main player when it changes
  useEffect(() => {
    if (activeVideo === undefined || videoRef.current === null) {
      return;
    }

    videoRef.current.innerHTML = "";
    videoRef.current.appendChild(activeVideo.el);
    activeVideo.el.volume = activeVideo.volume;
  }, [activeVideo]);

  return (
    <Flex height="100vh" width="100vw">
      <Flex grow="1" direction="column" width="75vw">
        <Flex flexGrow="1" bgColor={"black"} align={"center"}>
          <div ref={videoRef} />
        </Flex>
        <Flex align="center" bgColor={"gray.700"} p={"4"}>
          <ButtonGroup>
            <IconButton
              onClick={startPlaying}
              icon={<PlayerPlayIcon />}
              aria-label="Play"
              variant={playing === true ? "solid" : "outline"}
            />
            <IconButton
              onClick={stopPlaying}
              icon={<PlayerPauseIcon />}
              aria-label="Pause"
              variant={playing === true ? "outline" : "solid"}
            />
          </ButtonGroup>
        </Flex>
      </Flex>
      <Flex direction={"column"} bgColor={"gray.800"} align={"stretch"} justifyContent={"stretch"} width="25vw">
        <VideoList />
      </Flex>
    </Flex>
  );
}
