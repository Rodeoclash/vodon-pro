import { Box, Center, Flex, Text } from '@chakra-ui/react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Plus as PlusIcon } from 'tabler-icons-react';
import { getDiskPaths } from '../../services/file';
import { createVideosFromPaths } from '../../services/stores/videos';

export default function VideoAdd() {
  const handleDrop = useCallback((files: File[]) => {
    const paths = getDiskPaths(files, window.video.getPathForFile);

    createVideosFromPaths(paths).catch(console.error);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
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
