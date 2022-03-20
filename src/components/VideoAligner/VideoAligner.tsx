import {
  Box,
  Flex,
  IconButton,
  ButtonGroup,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
} from "@chakra-ui/react";

import {
  PlayerPlay as PlayerPlayIcon,
  PlayerTrackPrev as PlayerTrackPrevIcon,
  PlayerTrackNext as PlayerTrackNextIcon,
} from "tabler-icons-react";

import type { Video } from "../../services/store";

interface Props {
  video: Video;
}

export function VideoAligner({ video }: Props) {
  return (
    <Box position={"relative"}>
      <video src={video.file.path} />
      <Flex p={2} bgColor={"blackAlpha.800"} position={"absolute"} bottom={"0"} left={"0"} right={"0"} align={"center"}>
        <IconButton icon={<PlayerTrackPrevIcon />} aria-label="Step backwards" />

        <Slider aria-label="slider-ex-1" defaultValue={30}>
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>

        <IconButton icon={<PlayerTrackNextIcon />} aria-label="Step backwards" />
      </Flex>
    </Box>
  );
}
