import { useRef, useLayoutEffect } from "react";

import useStore from "../../services/store";

import { Box, Flex, IconButton, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Text } from "@chakra-ui/react";

import {
  PlayerPlay as PlayerPlayIcon,
  PlayerTrackPrev as PlayerTrackPrevIcon,
  PlayerTrackNext as PlayerTrackNextIcon,
} from "tabler-icons-react";

import type { Video } from "../../services/store";

interface Props {
  video: Video;
}

// TODO: Frame rate should be found using FFMPEG
const frameRate = 60;
const frameLength = 1 / frameRate;

export default function VideoAligner({ video }: Props) {
  const setVideoDuration = useStore((state) => state.setVideoDuration);
  const setVideoOffset = useStore((state) => state.setVideoOffset);

  const videoRef = useRef(null);

  useLayoutEffect(() => {
    function handleLoadedMetaData(event: Event) {
      setVideoDuration(video, videoRef.current.duration);
      videoRef.current.currentTime = video.offset;
    }

    function handleSeeked(event: Event) {
      setVideoOffset(video, videoRef.current.currentTime);
    }

    videoRef.current.addEventListener("loadedmetadata", handleLoadedMetaData);
    videoRef.current.addEventListener("seeked", handleSeeked);

    return () => {
      videoRef.current.removeEventListener("loadedmetadata", handleLoadedMetaData);
      videoRef.current.removeEventListener("seeked", handleSeeked);
    };
  }, []);

  function handleSliderChange(newTime: number) {
    videoRef.current.currentTime = newTime;
  }

  function handleClickStep(direction: number, event: MouseEvent) {
    const distance = (() => {
      if (event.getModifierState("Ctrl")) {
        return 1;
      }

      return frameLength;
    })();

    videoRef.current.currentTime = videoRef.current.currentTime + distance * direction;
  }

  const renderedControls =
    video.duration === null || video.offset === null ? null : (
      <Flex p={2} bgColor={"blackAlpha.800"} position={"absolute"} bottom={"0"} left={"0"} right={"0"} align={"center"}>
        <IconButton
          icon={<PlayerTrackPrevIcon />}
          aria-label="Step backwards"
          onClick={handleClickStep.bind(this, -1)}
        />

        <Text whiteSpace={"nowrap"} fontSize={"sm"} mx={"2"} align={"center"} width={"30"}>
          {video.offset.toFixed(2)} / {Math.round(video.duration)}
        </Text>

        <Slider
          aria-label="Align video scrubbing slider"
          defaultValue={video.offset ?? 0}
          mx={4}
          min={0}
          max={video.duration}
          onChange={handleSliderChange}
          step={frameLength}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>

        <IconButton
          icon={<PlayerTrackNextIcon />}
          aria-label="Step backwards"
          onClick={handleClickStep.bind(this, 1)}
        />
      </Flex>
    );

  return (
    <Box position={"relative"}>
      <Flex align={"center"} justifyContent={"center"}>
        <video src={video.file.path} ref={videoRef} />
      </Flex>
      {renderedControls}
    </Box>
  );
}
