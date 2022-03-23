import { Flex, Box } from "@chakra-ui/react";

interface Props {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

const mainStyleWidth = {
  sm: "60vw",
  lg: "65vw",
  xl: "70vw",
  "2xl": "75vw",
};

const sidebarStyleWidth = {
  sm: "40vw",
  lg: "35vw",
  xl: "30vw",
  "2xl": "25vw",
};

export default function WithSidebar({ children, sidebar }: Props) {
  return (
    <Flex>
      <Box width={mainStyleWidth}>{children}</Box>
      <Box width={sidebarStyleWidth}>{sidebar}</Box>
    </Flex>
  );
}
