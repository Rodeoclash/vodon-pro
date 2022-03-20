import { useState } from "react";
import { Box, Text, Flex, Grid, GridItem, Select, Spacer } from "@chakra-ui/react";

import useStore from "../services/store";

import { VideoAligner } from "../components/VideoAligner/VideoAligner";

export default function AlignVideos() {
  const videos = useStore((state) => state.videos);
  const [rowCount, setRowCount] = useState("2");

  const renderedVideos = videos.map((video) => {
    return (
      <GridItem key={video.id}>
        <VideoAligner video={video} />
      </GridItem>
    );
  });

  function handleRowCountChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setRowCount(event.target.value);
  }

  return (
    <Box width={"100vw"}>
      <Flex px={"4"} bgColor={"whiteAlpha.200"} flexGrow={"0"} height={"3rem"} align={"center"}>
        <Text fontSize={"sm"}>Align all videos on this page to the same point in time to synchonise playback</Text>
        <Spacer />
        <Select value={rowCount} onChange={handleRowCountChange}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </Select>
      </Flex>
      <Box overflowY={"auto"} height={"calc(100vh - 9rem)"}>
        <Grid templateColumns={`repeat(${rowCount}, 1fr)`} gap={0}>
          {renderedVideos}
        </Grid>
      </Box>
    </Box>
  );
}
