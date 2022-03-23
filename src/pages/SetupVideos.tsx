import { useState } from "react";
import { css } from "@emotion/react";

import {
  Box,
  Flex,
  Grid,
  GridItem,
  Select,
  Heading,
  ListItem,
  OrderedList,
  UnorderedList,
  Kbd,
} from "@chakra-ui/react";

import useStore from "../services/store";

import VideoAdd from "../components/VideoAdd/VideoAdd";
import VideoAligner from "../components/VideoAligner/VideoAligner";
import WithSidebar from "../layouts/WithSidebar";

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

  // TODO: Think about bringing this back if needed
  function handleRowCountChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setRowCount(event.target.value);
  }

  const renderedSidebar = (
    <Box p={4} color={"whiteAlpha.600"}>
      <Heading color={"white"} fontSize={"lg"} mb={"4"}>
        Getting started
      </Heading>
      <OrderedList my={"4"}>
        <ListItem mb={"4"}>Either click to add a video or drag and drop them from your desktop.</ListItem>
        <ListItem mb={"4"}>
          Pick a point in time that is easy to identify in all the videos (countdowns before a round start works well
          here)
        </ListItem>
        <ListItem mb={"4"}>Align all the videos to the same point in time using the controls on each video.</ListItem>
        <ListItem mb={"4"}>When all videos are aligned, go to the "Review" tab to start the VOD review</ListItem>
      </OrderedList>

      <Heading color={"white"} fontSize={"lg"} mb={"4"} mt={"8"}>
        Hints
      </Heading>
      <UnorderedList my={"4"}>
        <ListItem mb={"4"}>The arrow controls move you back and forward by one frame</ListItem>
        <ListItem mb={"4"}>
          Hold <Kbd>Control</Kbd> when clicking the arrow controls to move forward and back by one second
        </ListItem>
        <ListItem mb={"4"}>
          Hold <Kbd>Shift</Kbd> when clicking the arrow controls to move forward and back by ten seconds
        </ListItem>
      </UnorderedList>

      {/*
      <Heading fontSize={'lg'} my={'4'}>Controls</Heading>
      <Flex align={"center"}>
        <label style={{ whiteSpace: "nowrap" }}>Videos per row:</label>
        <Select value={rowCount} onChange={handleRowCountChange} ml={4}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </Select>
      </Flex>
      */}
    </Box>
  );

  return (
    <WithSidebar sidebar={renderedSidebar}>
      <Box overflowY={"auto"} height={"calc(100vh - 5rem)"} width={"100%"}>
        <Grid templateColumns={`repeat(${rowCount}, 1fr)`} gap={0}>
          {renderedVideos}
          <GridItem>
            <Flex css={addVideoCellStyles} bgColor={"whiteAlpha.100"} position={"relative"}>
              <VideoAdd />
            </Flex>
          </GridItem>
        </Grid>
      </Box>
    </WithSidebar>
  );
}
