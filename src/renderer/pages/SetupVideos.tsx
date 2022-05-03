import { css } from '@emotion/react';

import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Grid,
  GridItem,
  Heading,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  OrderedList,
} from '@chakra-ui/react';

import { Help as HelpIcon, X as XIcon } from 'tabler-icons-react';
import useVideoStore from '../services/stores/videos';
import useSettingsStore from '../services/stores/settings';

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
  const showSetupInstructions = useSettingsStore(
    (state) => state.showSetupInstructions
  );
  const videos = useVideoStore((state) => state.videos);

  const setShowSetupInstructions = useSettingsStore(
    (state) => state.setShowSetupInstructions
  );
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

  function handleCloseInstructions() {
    setShowSetupInstructions(false);
  }

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
          px={8}
          alignItems="center"
          justifyContent="flex-start"
        >
          <ButtonGroup size="sm">
            <Button
              colorScheme="cyan"
              leftIcon={<HelpIcon />}
              onClick={() => setShowSetupInstructions(true)}
            >
              Instructions
            </Button>
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
      <Modal
        isOpen={showSetupInstructions}
        onClose={() => handleCloseInstructions()}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>How to use</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Heading color="white" fontSize="lg" mb="4">
              Getting started
            </Heading>
            <OrderedList my="4">
              <ListItem mb="4">
                Either click to add videos or drag and drop them from your
                desktop.
              </ListItem>
              <ListItem mb="4">
                Pick a point in time that is easy to identify in all the videos
                (countdowns before a round start works well here)
              </ListItem>
              <ListItem mb="4">
                Align all the videos to the same point in time using the
                controls on each video.
              </ListItem>
              <ListItem mb="4">
                When all videos are aligned, go to the Review tab to start the
                VOD review
              </ListItem>
            </OrderedList>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={() => handleCloseInstructions()}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
