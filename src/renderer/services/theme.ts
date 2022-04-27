import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { createBreakpoints } from '@chakra-ui/theme-tools';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const styles = {
  global: () => ({
    body: {
      bg: '#111111',
    },
  }),
};

const breakpoints = createBreakpoints({
  sm: '320px',
  md: '768px',
  lg: '960px',
  xl: '1200px',
  '2xl': '1536px',
  '3xl': '1816px',
  '4xl': '2102px',
});

const theme = extendTheme({ config, styles, breakpoints });

export default theme;
