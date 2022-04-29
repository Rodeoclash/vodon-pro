import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  IconButton,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import {
  Settings as SettingsIcon,
  X as XIcon,
  PlayerPlay as PlayerPlayIcon,
  PlayerPause as PlayerPauseIcon,
} from 'tabler-icons-react';
import { secondsToHms } from '../../services/time';
import useStore from '../../services/store';

import VideoStepControl from '../VideoStepControl/VideoStepControl';

import type { Video } from '../../services/models/Video';

interface Props {
  video: Video;
}

export default function VideoAligner({ video }: Props) {
  const setVideoDuration = useStore((state) => state.setVideoDuration);
  const setVideoSyncTime = useStore((state) => state.setVideoSyncTime);
  const recalculateOffsets = useStore((state) => state.recalculateOffsets);
  const setVideoName = useStore((state) => state.setVideoName);
  const removeVideo = useStore((state) => state.removeVideo);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useLayoutEffect(() => {
    function handleSeeked(event: Event) {
      setVideoSyncTime(video, videoRef.current.currentTime);
      recalculateOffsets();
    }

    function handleLoadedMetaData(event: Event) {
      setVideoDuration(video, videoRef.current.duration);
      videoRef.current.currentTime = video.syncTime;
    }

    videoRef.current.addEventListener('loadedmetadata', handleLoadedMetaData);
    videoRef.current.addEventListener('seeked', handleSeeked);

    return () => {
      videoRef.current.removeEventListener(
        'loadedmetadata',
        handleLoadedMetaData
      );
      videoRef.current.removeEventListener('seeked', handleSeeked);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current === null || playing === null) {
      return;
    }

    if (playing === true) {
      videoRef.current.play();
    }

    if (playing === false) {
      videoRef.current.pause();
      setVideoSyncTime(video, videoRef.current.currentTime);
    }
  }, [playing]);

  function handleSliderChange(newTime: number) {
    videoRef.current.currentTime = newTime;
  }

  function handleClickStep(distance: number) {
    videoRef.current.currentTime = videoRef.current.currentTime + distance;
  }

  function handleClickName() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleRemove() {
    removeVideo(video);
    recalculateOffsets();
  }

  function handleChangeVideoName(event: React.ChangeEvent<HTMLInputElement>) {
    setVideoName(video, event.target.value);
  }

  const renderedControls =
    video.duration === null ? null : (
      <Flex
        p={2}
        bgColor="blackAlpha.800"
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        align="center"
      >
        <Box mr="2">
          {!playing && (
            <IconButton
              onClick={() => setPlaying(true)}
              icon={<PlayerPlayIcon />}
              aria-label="Play"
            />
          )}
          {playing && (
            <IconButton
              onClick={() => setPlaying(false)}
              icon={<PlayerPauseIcon />}
              aria-label="Pause"
            />
          )}
        </Box>

        <Box mr={2}>
          <VideoStepControl
            direction="backwards"
            frameRate={video.frameRate}
            onClick={(distance) => handleClickStep(distance)}
          />
        </Box>

        <Box mx={2}>
          <Text whiteSpace="nowrap" fontSize="sm" mx="2" align="center">
            Sync @ {secondsToHms(Math.round(video.syncTime))}
          </Text>
        </Box>

        <Slider
          aria-label="Align video scrubbing slider"
          defaultValue={video.syncTime}
          mx={2}
          min={0}
          max={video.duration}
          onChange={handleSliderChange}
          step={1 / video.frameRate}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>

        <Box ml={2}>
          <VideoStepControl
            direction="forwards"
            frameRate={video.frameRate}
            onClick={(distance) => handleClickStep(distance)}
          />
        </Box>
      </Flex>
    );

  return (
    <>
      <Box position="relative">
        <Tooltip label="Edit player name">
          <Flex
            onClick={handleClickName}
            align="center"
            position="absolute"
            top="0"
            left="0"
            px="8"
            py="4"
            zIndex={1}
            bgColor="blackAlpha.600"
            cursor="pointer"
          >
            <SettingsIcon />
            <Heading
              fontSize="md"
              ml="2"
              fontWeight="normal"
              textDecoration="underline"
            >
              {video.name}
            </Heading>
          </Flex>
        </Tooltip>

        <Tooltip label="Remove this video">
          <Flex
            onClick={handleRemove}
            align="center"
            position="absolute"
            top="0"
            right="0"
            px="4"
            py="4"
            zIndex={1}
            bgColor="blackAlpha.800"
            cursor="pointer"
            color="red.500"
          >
            <XIcon />
          </Flex>
        </Tooltip>

        <Flex align="center" justifyContent="center">
          <video src={video.filePath} ref={videoRef} />
        </Flex>

        {renderedControls}
      </Box>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit video details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                value={video.name}
                onChange={handleChangeVideoName}
                autoFocus
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button onClick={handleClose}>Done</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
