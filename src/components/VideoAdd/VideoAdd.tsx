import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";

import useStore from "../../services/store";

import { Box, Center, Text, Flex } from "@chakra-ui/react";
import { Plus as PlusIcon } from "tabler-icons-react";

export default function VideoAdd() {
  const videos = useStore((state) => state.videos);
  const addVideo = useStore((state) => state.addVideo);

  const handleDrop = useCallback(
    (files: File[]) => {
      files.forEach((file, index) => {
        const id = uuidv4();
        const name = `Untitled #${videos.length + 1 + index}`;
        const filePath = file.path;
        const el = document.createElement("video");

        el.src = filePath;

        addVideo({
          duration: null,
          durationNormalised: null,
          el,
          filePath,
          frameRate: 60,
          id,
          name,
          offset: 0.0,
          offsetNormalised: null,
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

  return (
    <Flex
      {...getRootProps()}
      position={"absolute"}
      top={"0"}
      left={"0"}
      bottom={"0"}
      right={"0"}
      align={"center"}
      justifyContent={"center"}
    >
      <Box>
        <input {...getInputProps()} />
        <Center>
          <PlusIcon size={48} />
        </Center>
        <Center>
          <Text align={"center"}>
            {isDragActive ? (
              <span>Click or drag and drop the files here...</span>
            ) : (
              <span>Drop video(s) here to get started</span>
            )}
          </Text>
        </Center>
      </Box>
    </Flex>
  );
}
