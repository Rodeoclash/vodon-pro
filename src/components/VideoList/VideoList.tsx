import React, { useCallback, Component, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";

import useStore from "../../services/store";

import { Box, Flex, Center, Text } from "@chakra-ui/react";
import { Video as VideoIcon } from "tabler-icons-react";

import Video from "../VideoThumbnail/VideoThumbnail";

export default function VideoList() {
  const videos = useStore((state) => state.videos);
  const addVideo = useStore((state) => state.addVideo);

  const handleDrop = useCallback(
    (files: File[]) => {
      files.forEach((file) => {
        const id = uuidv4();
        const name = `Untitled #${videos.length + 1}`;
        const el = document.createElement("video");

        el.src = file.path;

        addVideo({
          duration: null,
          durationNormalised: null,
          el,
          file,
          id,
          name,
          offsetNormalised: null,
          offset: 0.0,
          volume: 0.8,
        });
      });
    },
    [videos]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: "video/mp4, video/webm, video/ogg",
    useFsAccessApi: false,
  });

  const renderedVideos = videos.map((video) => {
    return <Video key={video.id} video={video} />;
  });

  return (
    <Flex grow={"1"} direction={"column"} overflowY={"scroll"}>
      <Box>{renderedVideos}</Box>
      <Flex
        flexGrow={"1"}
        color={"gray.600"}
        {...getRootProps()}
        m={4}
        padding={"4"}
        align={"center"}
        justifyContent={"center"}
      >
        <Box>
          <input {...getInputProps()} />
          <Center>
            <VideoIcon size={48} />
          </Center>
          <Center>
            <Text align={"center"}>
              {isDragActive ? (
                <span>Click or drag and drop the files here...</span>
              ) : (
                <span>Drop videos here to get started</span>
              )}
            </Text>
          </Center>
        </Box>
      </Flex>
    </Flex>
  );
}
