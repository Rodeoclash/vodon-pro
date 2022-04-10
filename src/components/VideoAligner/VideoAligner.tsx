import React, { useRef, useLayoutEffect, useState } from "react";

import { secondsToHms } from "../../services/time";
import useStore from "../../services/store";

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
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { Settings as SettingsIcon, X as XIcon } from "tabler-icons-react";

import VideoStepControl from "../VideoStepControl/VideoStepControl";

import type { Video } from "../../services/models/Video";

interface Props {
  video: Video;
}

export default function VideoAligner({ video }: Props) {
  const setVideoDuration = useStore((state) => state.setVideoDuration);
  const setVideoOffset = useStore((state) => state.setVideoOffset);
  const setVideoName = useStore((state) => state.setVideoName);
  const removeVideo = useStore((state) => state.removeVideo);

  const videoRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);

  useLayoutEffect(() => {
    function handleLoadedMetaData(event: Event) {
      setVideoDuration(video, videoRef.current.duration);
      videoRef.current.currentTime = video.offset;
    }

    function handleSeeked(event: Event) {
      setVideoOffset(video, videoRef.current.currentTime);
    }

    videoRef.current.addEventListener("loadedmetadata", handleLoadedMetaData);
    videoRef.current.addEventListener("seeked", handleSeeked);

    return () => {
      videoRef.current.removeEventListener(
        "loadedmetadata",
        handleLoadedMetaData
      );
      videoRef.current.removeEventListener("seeked", handleSeeked);
    };
  }, []);

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
  }

  function handleChangeVideoName(event: React.ChangeEvent<HTMLInputElement>) {
    setVideoName(video, event.target.value);
  }

  const renderedControls =
    video.duration === null ? null : (
      <Flex
        p={2}
        bgColor={"blackAlpha.800"}
        position={"absolute"}
        bottom={"0"}
        left={"0"}
        right={"0"}
        align={"center"}
      >
        <Box mr={2}>
          <VideoStepControl
            direction="backwards"
            frameRate={video.frameRate}
            onClick={handleClickStep}
          />
        </Box>

        <Box mx={2}>
          <Text whiteSpace={"nowrap"} fontSize={"sm"} mx={"2"} align={"center"}>
            {secondsToHms(Math.round(video.offset))} /{" "}
            {secondsToHms(Math.round(video.duration))}
          </Text>
        </Box>

        <Slider
          aria-label="Align video scrubbing slider"
          defaultValue={video.offset ?? 0}
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
            onClick={handleClickStep}
          />
        </Box>
      </Flex>
    );

  return (
    <>
      <Box position={"relative"}>
        <Tooltip label="Edit player name">
          <Flex
            onClick={handleClickName}
            align={"center"}
            position={"absolute"}
            top={"0"}
            left={"0"}
            px={"8"}
            py={"4"}
            zIndex={1}
            bgColor={"blackAlpha.600"}
            cursor={"pointer"}
          >
            <SettingsIcon />
            <Heading
              fontSize={"md"}
              ml={"2"}
              fontWeight={"normal"}
              textDecoration={"underline"}
            >
              {video.name}
            </Heading>
          </Flex>
        </Tooltip>

        <Tooltip label="Remove this video">
          <Flex
            onClick={handleRemove}
            align={"center"}
            position={"absolute"}
            top={"0"}
            right={"0"}
            px={"4"}
            py={"4"}
            zIndex={1}
            bgColor={"blackAlpha.800"}
            cursor={"pointer"}
            color={"red.500"}
          >
            <XIcon />
          </Flex>
        </Tooltip>

        <Flex align={"center"} justifyContent={"center"}>
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
