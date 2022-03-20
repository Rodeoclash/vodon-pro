import {
  Box,
  Flex,
  Button,
  ButtonGroup,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
} from "@chakra-ui/react";

import type { Video } from "../../services/store";

interface Props {
  video: Video;
}

export function VideoAligner({ video }: Props) {
  return (
    <Box position={"relative"}>
      <video src={video.file.path} />
      <Flex p={2} bgColor={"blackAlpha.800"} position={"absolute"} bottom={"0"} left={"0"} right={"0"}>
        Controls
      </Flex>
    </Box>
  );
}
