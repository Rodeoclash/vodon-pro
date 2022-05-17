import { css } from '@emotion/react';

import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Grid,
  GridItem,
} from '@chakra-ui/react';

import { X as XIcon } from 'tabler-icons-react';
import useVideoStore from '../services/stores/videos';

import VideoAdd from '../components/VideoAdd/VideoAdd';
import VideoAligner from '../components/VideoAligner/VideoAligner';

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

export default function SetupVideos() {
  const videos = useVideoStore((state) => state.videos);

  const clearVideos = useVideoStore((state) => state.clearVideos);

  const renderedVideos = videos.map((video) => {
    return (
      <GridItem
        key={video.id}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VideoAligner video={video} />
      </GridItem>
    );
  });

  function handleClearVideos() {
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure you want to remove all videos?')) {
      clearVideos();
    }
  }

  return (
    <>
      <Box overflowY="auto" height="calc(100vh - 5rem)" width="100%">
        <Flex
          boxSizing="border-box"
          borderBottom="1px"
          borderColor="whiteAlpha.300"
          height="4rem"
          px={4}
          alignItems="center"
          justifyContent="flex-start"
        >
          <ButtonGroup size="sm">
            <Button
              colorScheme="red"
              leftIcon={<XIcon />}
              onClick={() => handleClearVideos()}
            >
              Remove all videos
            </Button>
          </ButtonGroup>
        </Flex>
        <Grid templateColumns="repeat(2, 1fr)" gap={0}>
          {renderedVideos}
          <GridItem>
            <Flex
              css={addVideoCellStyles}
              bgColor="whiteAlpha.100"
              position="relative"
            >
              <VideoAdd />
            </Flex>
          </GridItem>
        </Grid>
      </Box>
    </>
  );
}
