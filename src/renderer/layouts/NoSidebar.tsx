import { Box, Flex } from '@chakra-ui/react';

interface Props {
  children: React.ReactNode;
}

export default function NoSidebar({ children }: Props) {
  return (
    <Flex>
      <Box width="100vw" bgColor="black">
        {children}
      </Box>
    </Flex>
  );
}
