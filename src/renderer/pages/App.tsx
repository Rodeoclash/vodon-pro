import { useState, useEffect, useCallback } from 'react';
import { Global, css } from '@emotion/react';

import {
  Box,
  Button,
  ChakraProvider,
  ColorModeScript,
  Flex,
  Heading,
  Kbd,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  OrderedList,
  Spacer,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import { Outlet, useLocation } from 'react-router-dom';

import { Help as HelpIcon } from 'tabler-icons-react';
import { getPossibleArgVMoviePaths } from '../services/file';

import useSettingsStore from '../services/stores/settings';
import useVideoStore, {
  createVideosFromPaths,
} from '../services/stores/videos';
import theme from '../services/theme';
import garet from '../assets/fonts/Garet-Heavy.otf';

import NavLink from '../components/NavLink/NavLink';

export default function App() {
  const addVideo = useVideoStore((state) => state.addVideo);
  const clearVideos = useVideoStore((state) => state.clearVideos);

  const setShownFirstHelpReview = useSettingsStore(
    (state) => state.setShownFirstHelpReview
  );

  const setShownFirstHelpSetup = useSettingsStore(
    (state) => state.setShownFirstHelpSetup
  );

  const showFirstHelpReview = useSettingsStore(
    (state) => state.shownFirstHelpReview
  );

  const showFirstHelpSetup = useSettingsStore(
    (state) => state.shownFirstHelpSetup
  );

  const arrowKeyJumpDistance = useSettingsStore(
    (state) => state.arrowKeyJumpDistance
  );

  const [version, setVersion] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { pathname } = useLocation();

  useEffect(() => {
    // Fetch the version of the app
    window.app
      .getVersion()
      .then((result) => {
        return setVersion(result);
      })
      .catch((e) => {
        throw e;
      });

    // Fetch any arguments passed to theapp
    window.app
      .getArgv()
      .then((results) => {
        const paths = getPossibleArgVMoviePaths(results);

        if (paths.length > 0) {
          clearVideos();
          createVideosFromPaths(paths);
        }

        return undefined;
      })
      .catch((e) => {
        throw e;
      });
  }, [addVideo, clearVideos]);

  const showHelpButton = pathname === '/' || pathname === '/review';

  const modalOpen =
    isOpen === true ||
    (pathname === '/' && showFirstHelpSetup === false) ||
    (pathname === '/review' && showFirstHelpReview === false);

  const handleClose = useCallback(() => {
    if (pathname === '/') {
      setShownFirstHelpSetup(true);
    }

    if (pathname === '/review') {
      setShownFirstHelpReview(true);
    }

    onClose();
  }, [pathname, setShownFirstHelpSetup, setShownFirstHelpReview, onClose]);

  const renderedHelpContents = (() => {
    if (pathname === '/') {
      return (
        <OrderedList my="4">
          <ListItem mb="4">
            Either click to add videos or drag and drop them from your desktop.
          </ListItem>
          <ListItem mb="4">
            Pick a point in time that is easy to identify in all the videos
            (countdowns before a round start works well here)
          </ListItem>
          <ListItem mb="4">
            Align all the videos to the same point in time using the controls on
            each video.
          </ListItem>
          <ListItem mb="4">
            When all videos are aligned, go to the Review tab to start the VOD
            review
          </ListItem>
        </OrderedList>
      );
    }

    if (pathname === '/review') {
      return (
        <TableContainer>
          <Table variant="striped" size="sm">
            <TableCaption>Keyboard Shortcuts</TableCaption>
            <Thead>
              <Tr>
                <Th>Shortcut</Th>
                <Th>Description</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>
                  <Kbd>A</Kbd>, <Kbd>←</Kbd>
                </Td>
                <Td>Previous frame</Td>
              </Tr>
              <Tr>
                <Td>
                  <Kbd>D</Kbd>, <Kbd>→</Kbd>
                </Td>
                <Td>Next frame</Td>
              </Tr>
              <Tr>
                <Td>
                  <Kbd>W</Kbd>, <Kbd>↑</Kbd>
                </Td>
                <Td>
                  Jump {arrowKeyJumpDistance}s forward (you can adjust distance
                  in the Settings page)
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Kbd>S</Kbd>, <Kbd>↓</Kbd>
                </Td>
                <Td>
                  Jump {arrowKeyJumpDistance}s back (you can adjust distance in
                  the Settings page)
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Kbd>Space</Kbd>
                </Td>
                <Td>Toggle pause / play</Td>
              </Tr>
              <Tr>
                <Td>
                  <Kbd>H</Kbd>
                </Td>
                <Td>Hold to hide controls</Td>
              </Tr>
              <Tr>
                <Td>
                  <Kbd>1 - 9</Kbd>
                </Td>
                <Td>Jump to players viewpoint</Td>
              </Tr>
              <Tr>
                <Td>
                  <Kbd>Escape</Kbd>
                </Td>
                <Td>Edit presentation mode</Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      );
    }

    return null;
  })();

  return (
    <>
      <Global
        styles={css`
          @font-face {
            font-family: 'Garet';
            src: url(${garet}) format('opentype');
            font-weight: normal;
            font-style: normal;
          }

          .tl-container {
            background-color: transparent !important;
          }
        `}
      />
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <Flex direction="column" height="100vh" width="100vw">
          <Flex
            px={4}
            as="header"
            align="center"
            borderBottom="1px"
            borderColor="whiteAlpha.300"
            height="5rem"
          >
            <Box>
              <Heading fontWeight="normal" fontFamily="Garet" fontSize="2xl">
                VODON PRO
              </Heading>
              <Text fontSize="sm" mt={0}>
                v{version}
              </Text>
            </Box>
            <Flex as="nav" ml="4">
              <NavLink to="/">Setup</NavLink>
              <NavLink to="/review">Review</NavLink>
              <NavLink to="/settings">Settings</NavLink>
              <NavLink to="/about">About</NavLink>
            </Flex>
            <Spacer />
            {showHelpButton === true && (
              <Button leftIcon={<HelpIcon />} onClick={() => onOpen()}>
                Help
              </Button>
            )}
          </Flex>
          <Flex as="main" height="calc(100vh - 5rem)" overflow="hidden">
            <Outlet />
          </Flex>
        </Flex>
        <Modal isOpen={modalOpen} onClose={() => handleClose()} size="2xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Help</ModalHeader>
            <ModalCloseButton />
            <ModalBody>{renderedHelpContents}</ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={() => handleClose()}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </ChakraProvider>
    </>
  );
}
