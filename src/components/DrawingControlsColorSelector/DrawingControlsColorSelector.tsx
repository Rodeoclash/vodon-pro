import * as React from "react";
import {
  Flex,
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
} from "@chakra-ui/react";
import { TldrawApp, ColorStyle } from "@tldraw/tldraw";

type PropsType = {
  app: TldrawApp;
};

const colors = {
  [ColorStyle.White]: "#f0f1f3",
  [ColorStyle.LightGray]: "#c6cbd1",
  [ColorStyle.Gray]: "#788492",
  [ColorStyle.Black]: "#1d1d1d",
  [ColorStyle.Green]: "#36b24d",
  [ColorStyle.Cyan]: "#0e98ad",
  [ColorStyle.Blue]: "#1c7ed6",
  [ColorStyle.Indigo]: "#4263eb",
  [ColorStyle.Violet]: "#7746f1",
  [ColorStyle.Red]: "#ff2133",
  [ColorStyle.Orange]: "#ff9433",
  [ColorStyle.Yellow]: "#ffc936",
};

export default function DrawingControlsColorSelector({ app }: PropsType) {
  const [isOpen, setIsOpen] = React.useState(false);

  const currentStyle = app.useStore((s) => s.appState.currentStyle);

  const handleColourPick = React.useCallback((color: ColorStyle) => {
    app.style({ color });
    setIsOpen(false);
  }, []);

  const swatchesData = Object.entries(colors);

  const renderedSwatches = swatchesData.map(
    ([key, value]: [ColorStyle, string]) => {
      return (
        <Box
          mx={1}
          my={1}
          key={key}
          width="1.5rem"
          height="1.5rem"
          backgroundColor={value}
          cursor={"pointer"}
          onClick={() => handleColourPick(key)}
        />
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
        <Box
          width={"2rem"}
          height={"2rem"}
          bgColor={colors[currentStyle.color]}
          cursor={"pointer"}
          onClick={() => setIsOpen(true)}
        />
      </PopoverTrigger>
      <PopoverContent width={`${swatchesData.length * 2}rem`}>
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
