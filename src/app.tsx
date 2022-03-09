import * as React from "react";
import * as ReactDOM from "react-dom";
import theme from "./services/theme";

import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { Flex, Box, Text } from "@chakra-ui/react";

import VideoList from "./components/VideoList/VideoList";

function App() {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <Flex height="100vh" width="100vw">
          <Flex grow="1" direction="column">
            <Box flexGrow="1" bgColor={"black"}>
              Video player
            </Box>
            <Flex align="center" height="2rem" bgColor={"gray.700"}>
              Controls
            </Flex>
          </Flex>
          <Flex direction={"column"} width="25rem" bgColor={"gray.800"} align={"stretch"} justifyContent={"stretch"}>
            <VideoList />
          </Flex>
        </Flex>
      </ChakraProvider>
    </>
  );
}

const destination = document.getElementById("app");

ReactDOM.render(<App />, destination);
