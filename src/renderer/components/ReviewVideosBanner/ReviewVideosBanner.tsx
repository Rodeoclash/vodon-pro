import { ReactNode } from 'react';

import { Flex } from '@chakra-ui/react';

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
    >
      {children}
    </Flex>
  );
}
