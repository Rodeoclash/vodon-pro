import React from "react";

import theme from "../services/theme";

import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";

import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <Outlet />
      </ChakraProvider>
    </>
  );
}
