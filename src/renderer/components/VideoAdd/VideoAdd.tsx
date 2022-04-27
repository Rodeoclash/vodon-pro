import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import { Box, Center, Text, Flex } from '@chakra-ui/react';
import { Plus as PlusIcon } from 'tabler-icons-react';
import useStore from '../../services/store';
import { createFromFile } from '../../services/models/Video';

export default function VideoAdd() {
  const videos = useStore((state) => state.videos);
  const addVideo = useStore((state) => state.addVideo);

  const handleDrop = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        const video = await createFromFile(file.path);

        // add the video to the store
        addVideo(video);
      }
    },
    [videos]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: 'video/mp4, video/webm, video/ogg',
    useFsAccessApi: false,
  });

  return (
    <Flex
      {...getRootProps()}
      position="absolute"
      top="0"
      left="0"
      bottom="0"
      right="0"
      align="center"
      justifyContent="center"
    >
      <Box>
        <input {...getInputProps()} />
        <Center>
          <PlusIcon size={48} />
        </Center>
        <Center>
          <Text align="center">
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