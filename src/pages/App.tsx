import { useState, useEffect } from "react";
import { Global, css } from "@emotion/react";

import theme from "../services/theme";
import garet from "../assets/fonts/Garet-Heavy.otf";

import { ChakraProvider, ColorModeScript, Text, Heading, Flex, Spacer } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

import NavLink from "../components/NavLink/NavLink";

export default function App() {
  const [version, setVersion] = useState(null);

  // On load, fetch the version of the app
  useEffect(() => {
    window.app.getVersion().then((result: string) => {
      setVersion(result);
    });
  }, []);

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

          .tl-container {
            background-color: transparent !important;
          }
        `}
      />
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <Flex direction={"column"} height={"100vh"} width={"100vw"}>
          <Flex
            px={8}
            as={"header"}
            align={"center"}
            borderBottom={"1px"}
            borderColor={"whiteAlpha.300"}
            height={"5rem"}
          >
            <Heading fontWeight={"normal"} fontFamily={"Garet"} fontSize={"2xl"}>
              VODON PRO
            </Heading>
            <Flex as={"nav"} ml={"4"}>
              <NavLink to="/">Setup videos</NavLink>
              <NavLink to="/review">Review</NavLink>
              <NavLink to="/settings">Settings</NavLink>
              <NavLink to="/about">About</NavLink>
            </Flex>
            <Spacer />
            <Text fontSize={"sm"}>Version {version}</Text>
          </Flex>
          <Flex as={"main"} height={"calc(100vh - 5rem)"}>
            <Outlet />
          </Flex>
        </Flex>
      </ChakraProvider>
    </>
  );
}
