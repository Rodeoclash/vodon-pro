import { Global, css } from "@emotion/react";

import theme from "../services/theme";
import garet from "../assets/fonts/Garet-Heavy.otf";

import { ChakraProvider, ColorModeScript, Box, Heading, Flex, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <>
      <Global
        styles={css`
          @font-face {
            font-family: "Garet";
            src: url(${garet}) format("opentype");
            font-weight: normal;
            font-style: normal;
          }
        `}
      />
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <Flex direction={"column"} height={"100vh"} width={"100vw"}>
          <Flex
            px={4}
            as={"header"}
            align={"center"}
            borderBottom={"1px"}
            borderColor={"whiteAlpha.300"}
            height={"5rem"}
          >
            <Heading fontWeight={"normal"} fontFamily={"Garet"} fontSize={"2xl"}>
              VODON PRO
            </Heading>
            <Box as={"nav"} ml={"8"}>
              <Link as={RouterLink} to="/">
                Review
              </Link>
              <Link as={RouterLink} to="/manage_videos" ml={"8"}>
                Manage videos
              </Link>
            </Box>
          </Flex>
          <Flex as={"main"} height={"calc(100vh - 5rem)"}>
            <Outlet />
          </Flex>
        </Flex>
      </ChakraProvider>
    </>
  );
}
