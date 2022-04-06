import { css } from "@emotion/react";

import { Flex, Box } from "@chakra-ui/react";

interface Props {
  children: React.ReactNode;
  disableSidebar?: boolean;
  sidebar: React.ReactNode;
}

export default function WithSidebar({
  children,
  sidebar,
  disableSidebar = false,
}: Props) {
  const mainStyleWidth =
    disableSidebar === true
      ? "100vw"
      : {
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

  const sidebarStyles = css`
    display: ${disableSidebar === true ? "none" : "block"};
  `;

  return (
    <Flex>
      <Box width={mainStyleWidth} bgColor={"black"}>
        {children}
      </Box>
      <Box
        css={sidebarStyles}
        width={sidebarStyleWidth}
        boxSizing={"border-box"}
        borderLeft={"1px"}
        borderColor={"whiteAlpha.300"}
        overflowY={"auto"}
      >
        {sidebar}
      </Box>
    </Flex>
  );
}
