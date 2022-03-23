import { useRef, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { css } from "@emotion/react";

import useStore from "../services/store";

import {
  Flex,
  Box,
  Text,
  ButtonGroup,
  IconButton,
  SliderTrack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";

import { PlayerPlay as PlayerPlayIcon, PlayerPause as PlayerPauseIcon } from "tabler-icons-react";

import WithSidebar from "../layouts/WithSidebar";
import VideoThumbnail from "../components/VideoThumbnail/VideoThumbnail";

const videoStyle = css`
  video {
    height: 100%;
    aspect-ratio: 16 / 9;
  }
`;

export default function ReviewVideos() {
  const videoRef = useRef(null);

  const startPlaying = useStore((state) => state.startPlaying);
  const stopPlaying = useStore((state) => state.stopPlaying);
  const setCurrentTime = useStore((state) => state.setCurrentTime);

  const activeVideoId = useStore((state) => state.activeVideoId);
  const currentTime = useStore((state) => state.currentTime);
  const maxDuration = useStore((state) => state.maxDuration);
  const playing = useStore((state) => state.playing);
  const videos = useStore((state) => state.videos);

  const activeVideo = videos.find((video) => {
    return activeVideoId === video.id;
  });

  // spacebar starts / stop play
  useHotkeys(
    "space",
    () => {
      if (playing === true) {
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

  // when play is in progress, recalculate the currentTime
  useEffect(() => {
    if (playing === false) {
      return;
    }

    const lastTick = Date.now();

    const timer = setTimeout(() => {
      setCurrentTime(currentTime + (Date.now() - lastTick) / 1000);
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [playing, currentTime]);

  function handleSliderChange(newTime: number) {
    stopPlaying();
    setCurrentTime(newTime);
  }

  const renderedGlobalTimeSlider = (() => {
    if (maxDuration === null) {
      return null;
    }

    const contents = (
      <>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </>
    );

    if (playing === false) {
      return (
        <Slider
          key="notplaying"
          aria-label="Global time control"
          defaultValue={currentTime}
          min={0}
          max={maxDuration}
          onChange={handleSliderChange}
          step={0.25}
        >
          {contents}
        </Slider>
      );
    } else {
      return (
        <Slider
          key="playing"
          aria-label="Global time control"
          value={currentTime}
          min={0}
          max={maxDuration}
          onChange={handleSliderChange}
          step={0.25}
        >
          {contents}
        </Slider>
      );
    }
  })();

  const renderedVideoThumbnails = videos.map((video) => {
    return <VideoThumbnail key={video.id} video={video} />;
  });

  return (
    <WithSidebar sidebar={renderedVideoThumbnails}>
      <Flex direction="column" width="100%" height={"calc(100vh - 6rem)"}>
        <Flex flexGrow={"1"} flexShrink={"1"} align={"center"} ref={videoRef} css={videoStyle} />
        <Flex flexGrow={"0"} align="center" p={"4"}>
          <ButtonGroup flexShrink={"1"}>
            <IconButton
              onClick={startPlaying}
              icon={<PlayerPlayIcon />}
              aria-label="Play"
              variant={playing !== null ? "solid" : "outline"}
            />
            <IconButton
              onClick={stopPlaying}
              icon={<PlayerPauseIcon />}
              aria-label="Pause"
              variant={playing === null ? "outline" : "solid"}
            />
          </ButtonGroup>
          <Box flexGrow={"1"} ml={"4"}>
            {renderedGlobalTimeSlider}
          </Box>
        </Flex>
      </Flex>
    </WithSidebar>
  );
}
