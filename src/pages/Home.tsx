import { useRef, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { css } from "@emotion/react";

import useStore from "../services/store";

import { Flex, Box, Text, ButtonGroup, IconButton } from "@chakra-ui/react";
import { PlayerPlay as PlayerPlayIcon, PlayerPause as PlayerPauseIcon } from "tabler-icons-react";
import { Link } from "react-router-dom";

import VideoList from "../components/VideoList/VideoList";

const videoStyle = css`
  video {
    height: 100%;
    aspect-ratio: 16 / 9;
  }
`;

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
    <Flex>
      <Flex grow="1" direction="column" width="75vw">
        <Flex flexGrow={"1"} flexShrink={"1"} bgColor={"black"} align={"center"} ref={videoRef} css={videoStyle} />
        <Flex flexGrow={"0"} align="center" bgColor={"black"} p={"4"}>
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
      <Flex direction={"column"} align={"stretch"} justifyContent={"stretch"} width="25vw">
        <VideoList />
      </Flex>
    </Flex>
  );
}
