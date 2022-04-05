import { useRef, useEffect, useState, useLayoutEffect, useCallback, SyntheticEvent, MouseEventHandler } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { css } from "@emotion/react";

import useStore from "../services/store";
import { getRatioDimensions } from "../services/layout";

import { Flex, Box, Text, IconButton, Switch, FormControl, FormLabel, Heading } from "@chakra-ui/react";

import {
  PlayerPlay as PlayerPlayIcon,
  PlayerPause as PlayerPauseIcon,
  Maximize as MaximizeIcon,
} from "tabler-icons-react";
import { Link } from "react-router-dom";

import CurrentTimeSliderControl from "../components/CurrentTimeSliderControl/CurrentTimeSliderControl";
import Drawing from "../components/Drawing/Drawing";
import VideoStepControl from "../components/VideoStepControl/VideoStepControl";
import VideoThumbnail from "../components/VideoThumbnail/VideoThumbnail";
import VideoVolume from "../components/VideoVolume/VideoVolume";
import WithSidebar from "../layouts/WithSidebar";

export default function ReviewVideos() {
  const overlayRef = useRef(null);
  const videoRef = useRef(null);
  const contentRef = useRef(null);

  const [startedPlayingAt, setStartedPlayingAt] = useState(null);
  const [videoDimensions, setVideoDimensions] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [drawing, setDrawing] = useState(false);

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

  useHotkeys(
    "left",
    () => {
      if (playing === true) {
        return;
      }
      setCurrentTime(currentTime - 1 / 60);
    },
    {},
    [playing, currentTime]
  );

  useHotkeys(
    "right",
    () => {
      if (playing === true) {
        return;
      }
      setCurrentTime(currentTime + 1 / 60);
    },
    {},
    [playing, currentTime]
  );

  useHotkeys(
    "escape",
    () => {
      setFullscreen(false);
    },
    {},
    []
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

  // when we start playing, store the time that play started
  useEffect(() => {
    if (playing === false) {
      return setStartedPlayingAt(null);
    }

    setDrawing(false);
    setStartedPlayingAt(Date.now());
  }, [playing]);

  // when we have a time we started playing at, start a click to update the current time
  useEffect(() => {
    if (startedPlayingAt === null) {
      return;
    }

    function updateCurrentTime() {
      setCurrentTime(currentTime + (Date.now() - startedPlayingAt) / 1000 - 0.06); // HACK HACK - We should use something where we have control over the clock driving the video.
    }

    const timer = setInterval(updateCurrentTime, 500);

    return () => {
      updateCurrentTime();
      clearInterval(timer);
    };
  }, [startedPlayingAt]);

  // watch for fullscreen being set and trigger
  useEffect(() => {
    if (fullscreen === null) {
      return;
    }

    if (fullscreen === true) {
      (async () => {
        await contentRef.current.requestFullscreen();
        window.dispatchEvent(new Event("resize"));
      })();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, [fullscreen]);

  // watch for the video element being resized and adjust accordingly
  useLayoutEffect(() => {
    const handleResize = () => {
      if (overlayRef.current === null || activeVideo === undefined) {
        return;
      }

      const dimensions = getRatioDimensions(activeVideo.displayAspectRatio, overlayRef.current);
      setVideoDimensions(dimensions);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [activeVideo]);

  // Trigger resize event on load of element, needs timeout to wait for video element to be fully present
  useLayoutEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    });
  }, []);

  const handleClickStep = (distance: number) => {
    setCurrentTime(useStore.getState().currentTime + distance); // HACK HACK - why does it have to read directly from the state here??
  };

  function handleToggleDrawingChange() {
    setDrawing(!drawing);
  }

  async function handleClickFullscreen() {
    setFullscreen(!fullscreen);
  }

  const overlayStyle = css`
    width: ${videoDimensions ? videoDimensions[0] : ""}px;
    height: ${videoDimensions ? videoDimensions[1] : ""}px;
  `;

  const videoStyle = css`
    video {
      width: ${videoDimensions ? videoDimensions[0] : ""}px;
      height: ${videoDimensions ? videoDimensions[1] : ""}px;
    }
  `;

  const renderedSidebarVideos = videos.map((video) => {
    return <VideoThumbnail key={video.id} video={video} />;
  });

  const renderedSidebar = (
    <Flex direction={"column"} height={"calc(100vh - 5rem)"} justifyContent={"space-evenly"}>
      {renderedSidebarVideos}
    </Flex>
  );

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

    if (activeVideo === undefined) {
      return (
        <Flex flexGrow={"1"} align={"center"} justifyContent={"center"} fontSize={"3xl"} color={"whiteAlpha.400"}>
          <Link to="/">
            <Text>Please choose a video</Text>
          </Link>
        </Flex>
      );
    }

    return (
      <>
        {videoDimensions && (
          <Box borderBottom={"1px"} borderColor={"whiteAlpha.300"}>
            <Flex
              mx={"auto"}
              alignItems={"center"}
              justifyContent={"space-between"}
              height={"4rem"}
              width={`${videoDimensions[0]}px`}
              px={8}
              boxSizing={"border-box"}
            >
              <Box>
                <Heading fontSize={"2xl"}>{activeVideo.name}</Heading>
              </Box>
              <Box>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="toggle-drawing" mb="0">
                    Enable drawing
                  </FormLabel>
                  <Switch
                    id="toggle-drawing"
                    onChange={handleToggleDrawingChange}
                    isChecked={drawing}
                    disabled={playing}
                  />
                </FormControl>
              </Box>
            </Flex>
          </Box>
        )}
        <Flex
          align={"center"}
          flexGrow={"1"}
          flexShrink={"1"}
          justifyContent={"center"}
          ref={overlayRef}
          overflow={"hidden"}
        >
          <Box position={"relative"} css={overlayStyle}>
            {activeVideoId !== null && drawing === true && <Drawing fullscreen={fullscreen} />}
            <Box css={videoStyle} ref={videoRef} />
          </Box>
        </Flex>
        <Flex
          flexGrow={"0"}
          align="center"
          p={"4"}
          boxSizing={"border-box"}
          borderTop={"1px"}
          borderColor={"whiteAlpha.300"}
        >
          <Box mr={"2"}>
            {!playing && <IconButton onClick={startPlaying} icon={<PlayerPlayIcon />} aria-label="Play" />}
            {playing && <IconButton onClick={stopPlaying} icon={<PlayerPauseIcon />} aria-label="Pause" />}
          </Box>

          <Box mx={"2"}>
            <VideoStepControl direction="backwards" frameRate={activeVideo.frameRate} onClick={handleClickStep} />
          </Box>

          <Text whiteSpace={"nowrap"} fontSize={"sm"} align={"center"} width={"32"}>
            {currentTime.toFixed(2)} / {maxDuration.toFixed(2)}
          </Text>

          <Box flexGrow={"1"} mx={"2"}>
            <CurrentTimeSliderControl video={activeVideo} />
          </Box>

          <Box mx={"2"}>
            <VideoVolume video={activeVideo} />
          </Box>

          <Box mx={"2"}>
            <VideoStepControl direction="forwards" frameRate={activeVideo.frameRate} onClick={handleClickStep} />
          </Box>

          <Box ml={"2"}>
            <IconButton onClick={handleClickFullscreen} icon={<MaximizeIcon />} aria-label="Fullscreen video" />
          </Box>
        </Flex>
      </>
    );
  })();

  return (
    <WithSidebar sidebar={renderedSidebar} disableSidebar={videos.length < 2}>
      <Flex direction="column" width="100%" height={"calc(100vh - 5rem)"} ref={contentRef}>
        {renderedContent}
      </Flex>
    </WithSidebar>
  );
}
