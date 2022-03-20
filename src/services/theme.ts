import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const styles = {
  global: () => ({
    body: {
      bg: "#111111",
    },
  }),
};

const theme = extendTheme({ config, styles });

export default theme;
