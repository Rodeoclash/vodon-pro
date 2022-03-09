import * as React from "react";

import { Flex, Box, Text } from "@chakra-ui/react";
import { Activity } from "tabler-icons-react";

import useStore from "../../services/store";

export default function VideoList() {
  const videos = useStore((state) => state.videos);

  if (videos.length === 0) {
    return (
      <Flex grow={"1"} align={"center"} justify={"center"}>
        <Box>
          <Activity size={24} />
          <Text fontSize={"lg"} color={"whiteAlpha.400"}>
            <em>Drag and drop videos here to get started</em>
          </Text>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex grow={"1"} align={"center"} justify={"center"}>
      Do something with videos
    </Flex>
  );
}
