import React, { useRef, useLayoutEffect, useState } from "react";

import useStore from "../../services/store";

import {
  Box,
  Flex,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  Heading,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { Settings as SettingsIcon, X as XIcon } from "tabler-icons-react";

import VideoStepControl from "../VideoStepControl/VideoStepControl";

import type { Video } from "../../services/models/Video";

interface Props {
  video: Video;
}

// TODO: Frame rate should be found using FFMPEG
const frameRate = 60;
const frameLength = 1 / frameRate;

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
      videoRef.current.removeEventListener("loadedmetadata", handleLoadedMetaData);
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
      <Flex p={2} bgColor={"blackAlpha.800"} position={"absolute"} bottom={"0"} left={"0"} right={"0"} align={"center"}>
        <VideoStepControl direction="backwards" frameRate={60} onClick={handleClickStep} />

        <Text whiteSpace={"nowrap"} fontSize={"sm"} mx={"2"} align={"center"} width={"32"}>
          {video.offset.toFixed(2)} / {Math.round(video.duration)}
        </Text>

        <Slider
          aria-label="Align video scrubbing slider"
          defaultValue={video.offset ?? 0}
          mx={4}
          min={0}
          max={video.duration}
          onChange={handleSliderChange}
          step={frameLength}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>

        <VideoStepControl direction="forwards" frameRate={60} onClick={handleClickStep} />
      </Flex>
    );

  return (
    <>
      <Box position={"relative"}>
        <Flex
          onClick={handleClickName}
          align={"center"}
          position={"absolute"}
          top={"0"}
          left={"0"}
          p={"2"}
          zIndex={1}
          bgColor={"blackAlpha.600"}
          cursor={"pointer"}
        >
          <SettingsIcon />
          <Heading fontSize={"md"} ml={"2"} fontWeight={"normal"} textDecoration={"underline"}>
            {video.name}
          </Heading>
        </Flex>

        <Flex
          onClick={handleRemove}
          align={"center"}
          position={"absolute"}
          top={"0"}
          right={"0"}
          p={"2"}
          zIndex={1}
          bgColor={"blackAlpha.800"}
          cursor={"pointer"}
          color={"red.500"}
        >
          <XIcon />
        </Flex>

        <Flex align={"center"} justifyContent={"center"}>
          <video src={video.filePath} ref={videoRef} />
        </Flex>

        {renderedControls}
      </Box>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit player</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>First name</FormLabel>
              <Input value={video.name} onChange={handleChangeVideoName} autoFocus />
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
