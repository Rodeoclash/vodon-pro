import { useRef, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { css } from "@emotion/react";
import { useBus } from "react-bus";

import useStore from "../services/store";

import { Flex, Box, Text, IconButton, SliderTrack, Slider, SliderFilledTrack, SliderThumb } from "@chakra-ui/react";

import {
  PlayerPlay as PlayerPlayIcon,
  PlayerPause as PlayerPauseIcon,
  PlayerTrackPrev as PlayerTrackPrevIcon,
  PlayerTrackNext as PlayerTrackNextIcon,
} from "tabler-icons-react";
import { Link } from "react-router-dom";

import WithSidebar from "../layouts/WithSidebar";
import VideoThumbnail from "../components/VideoThumbnail/VideoThumbnail";
import VideoStepControl from "../components/VideoStepControl/VideoStepControl";

const videoStyle = css`
  video {
    height: 100%;
    aspect-ratio: 16 / 9;
  }
`;

export default function ReviewVideos() {
  const bus = useBus();
  const videoRef = useRef(null);
  const [startedPlayingAt, setStartedPlayingAt] = useState(null);

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
      return setStartedPlayingAt(null);
    }

    setStartedPlayingAt(Date.now());
  }, [playing]);

  useEffect(() => {
    if (startedPlayingAt === null) {
      return;
    }

    console.log(startedPlayingAt);

    const timer = setInterval(() => {
      setCurrentTime(currentTime + (Date.now() - startedPlayingAt) / 1000);
    }, 50);

    return () => {
      clearInterval(timer);
    };
  }, [startedPlayingAt]);

  function handleSliderChange(newTime: number) {
    stopPlaying();
    setCurrentTime(newTime);
  }

  function handleClickStep(distance: number) {
    setCurrentTime(currentTime + distance);
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

  const renderedSidebar = videos.map((video) => {
    return <VideoThumbnail key={video.id} video={video} />;
  });

  const renderedContent = (() => {
    if (videos.length === 0) {
      return (
        <Flex flexGrow={"1"} align={"center"} justifyContent={"center"} fontSize={"3xl"} color={"whiteAlpha.400"}>
          <Link to="/">
            <Text>Please setup some videos first</Text>
          </Link>
        </Flex>
      );
    }

    return (
      <>
        <Flex
          flexGrow={"1"}
          flexShrink={"1"}
          align={"center"}
          justifyContent={"center"}
          ref={videoRef}
          css={videoStyle}
        />
        <Flex
          flexGrow={"0"}
          align="center"
          p={"4"}
          boxSizing={"border-box"}
          borderTop={"1px"}
          borderColor={"whiteAlpha.300"}
        >
          <Box mr={"4"}>
            {!playing && <IconButton onClick={startPlaying} icon={<PlayerPlayIcon />} aria-label="Play" />}
            {playing && <IconButton onClick={stopPlaying} icon={<PlayerPauseIcon />} aria-label="Pause" />}
          </Box>

          <VideoStepControl direction="backwards" frameRate={60} onClick={handleClickStep} />

          <Box flexGrow={"1"} mx={"4"}>
            {renderedGlobalTimeSlider}
          </Box>

          <VideoStepControl direction="forwards" frameRate={60} onClick={handleClickStep} />
        </Flex>
      </>
    );
  })();

  return (
    <WithSidebar sidebar={renderedSidebar}>
      <Flex direction="column" width="100%" height={"calc(100vh - 5rem)"}>
        {renderedContent}
      </Flex>
    </WithSidebar>
  );
}
