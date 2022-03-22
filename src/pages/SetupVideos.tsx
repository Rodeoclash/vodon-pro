import { useState } from "react";
import { css } from "@emotion/react";

import { Box, Text, Flex, Grid, GridItem, Select, Spacer } from "@chakra-ui/react";

import useStore from "../services/store";

import VideoAdd from "../components/VideoAdd/VideoAdd";
import VideoAligner from "../components/VideoAligner/VideoAligner";

const addVideoCellStyles = css`
  aspect-ratio: 16 / 9;
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.025) 25%,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.025) 50%,
    rgba(255, 255, 255, 0.025) 75%,
    rgba(255, 255, 255, 0.05) 75%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 56.57px 56.57px;
`;

export default function AddVideos() {
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
      <Flex
        px={"4"}
        bgColor={"whiteAlpha.200"}
        flexGrow={"0"}
        height={"3rem"}
        boxSizing={"border-box"}
        align={"center"}
        justifyContent={"space-between"}
        position={"relative"}
        zIndex={"1"}
        boxShadow="dark-lg"
      >
        <Text fontSize={"sm"}>Align all videos here to the same point in time to synchonise playback</Text>
        <Flex align={"center"}>
          <label style={{ whiteSpace: "nowrap" }}>Videos per row:</label>
          <Select value={rowCount} onChange={handleRowCountChange} ml={4}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </Select>
        </Flex>
      </Flex>
      <Box overflowY={"auto"} height={"calc(100vh - 9rem)"}>
        <Grid templateColumns={`repeat(${rowCount}, 1fr)`} gap={0}>
          {renderedVideos}
          <GridItem>
            <Flex css={addVideoCellStyles} bgColor={"whiteAlpha.100"} position={"relative"}>
              <VideoAdd />
            </Flex>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
}
