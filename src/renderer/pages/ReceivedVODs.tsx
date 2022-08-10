import { Flex, Heading, Text, Box, Container, Button } from '@chakra-ui/react';
import React from 'react';

import NoSidebar from '../layouts/NoSidebar';

export default function ReceivedVODs() {
  const handleOpenFileYeet = React.useCallback(() => {
    window.app.openBrowser('https://www.fileyeet.io/');
  }, []);

  return (
    <NoSidebar>
      <Flex
        p="8"
        overflow="auto"
        height="100%"
        width="100%"
        backgroundImage={
          'linear-gradient(rgba(0,0,0,0.80), rgba(0,0,0,0.95)), url("file:///assets/shubham-dhage-ykFTt5Dq1RU-unsplash.jpg")'
        }
        backgroundRepeat="no-repeat"
        backgroundPosition="center"
        backgroundSize="cover"
        alignItems="center"
        justifyContent="center"
      >
        <Container maxW="3xl" textAlign="center">
          <Heading as="h1" fontSize="5xl" mb="8">
            Received VODs coming soon!
          </Heading>
          <Text mb={8} fontSize="lg">
            Vodon Pro will soon be integrated with <strong>FileYeet</strong> to
            make it super simple to receive VOD files. Your players can upload
            their VOD files and they will appear inside the Vodon Pro app ready
            for review.
          </Text>
          <Box>
            <Button colorScheme="blue" onClick={() => handleOpenFileYeet()}>
              Open FileYeet
            </Button>
          </Box>
        </Container>
      </Flex>
    </NoSidebar>
  );
}
