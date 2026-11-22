import { Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function ReviewVideosBanner({ children }: Props) {
  return (
    <Flex
      flexGrow={1}
      align="center"
      justifyContent="center"
      fontSize="3xl"
      color="whiteAlpha.400"
      height="calc(100vh - 5rem)"
    >
      {children}
    </Flex>
  );
}
