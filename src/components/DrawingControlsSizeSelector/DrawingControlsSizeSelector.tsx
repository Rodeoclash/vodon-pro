import * as React from "react";

import useStore from "../../services/store";

import {
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
} from "@chakra-ui/react";
import { TldrawApp, SizeStyle } from "@tldraw/tldraw";

type PropsType = {
  app: TldrawApp;
};

const sizes = {
  [SizeStyle.Small]: "small",
  [SizeStyle.Medium]: "medium",
  [SizeStyle.Large]: "large",
};

export default function DrawingControlsSizeSelector({ app }: PropsType) {
  const [isOpen, setIsOpen] = React.useState(false);

  const currentStyle = app.useStore((s) => s.appState.currentStyle);

  const handleSizePick = React.useCallback((size: SizeStyle) => {
    app.style({ size });
    setIsOpen(false);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const sizesData = Object.entries(sizes);

  const renderedSwatches = sizesData.map(
    ([key, value]: [SizeStyle, string]) => {
      return (
        <Flex
          mx={1}
          my={1}
          key={key}
          width="1.5rem"
          height="1.5rem"
          cursor={"pointer"}
          onClick={() => handleSizePick(key)}
          align={"center"}
          justify={"center"}
          border={"1px"}
          borderColor={"whiteAlpha.600"}
          background={"whiteAlpha.200"}
          padding={"1rem"}
        >
          {value.slice(0, 1).toUpperCase()}
        </Flex>
      );
    }
  );

  return (
    <Popover
      placement={"right"}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <PopoverTrigger>
        <Flex
          width={"2rem"}
          height={"2rem"}
          cursor={"pointer"}
          background={"black"}
          align="center"
          justifyContent={"center"}
          border={"1px"}
          borderColor={"whiteAlpha.600"}
          onClick={handleOpen}
        >
          {sizes[currentStyle.size].slice(0, 1).toUpperCase()}
        </Flex>
      </PopoverTrigger>
      <PopoverContent width={`${sizesData.length * 3}rem`}>
        <PopoverArrow />
        <PopoverBody backgroundColor={"black"}>
          <Flex my={-1} mx={-1}>
            {renderedSwatches}
          </Flex>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
