import * as React from 'react';

import {
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Tooltip,
  Box,
} from '@chakra-ui/react';

import { TldrawApp, DashStyle } from '@tldraw/tldraw';

import {
  Circle as CircleIcon,
  SquaresFilled as SquaresFilledIcon,
  CircleDashed as CircleDashedIcon,
  CircleDotted as CircleDottedIcon,
} from 'tabler-icons-react';

type PropsType = {
  app: TldrawApp;
};

const dashes = {
  [DashStyle.Draw]: [<CircleIcon />, 'Line'],
  [DashStyle.Solid]: [<SquaresFilledIcon />, 'Filled'],
  [DashStyle.Dashed]: [<CircleDashedIcon />, 'Dashed'],
  [DashStyle.Dotted]: [<CircleDottedIcon />, 'Dotted'],
};

export default function DrawingControlsStyleSelector({ app }: PropsType) {
  const [isOpen, setIsOpen] = React.useState(false);

  const currentStyle = app.useStore((s) => s.appState.currentStyle);

  const handleSizePick = React.useCallback(
    (dash: DashStyle) => {
      app.style({ dash });
      setIsOpen(false);
    },
    [app]
  );

  const handleOpen = () => {
    setIsOpen(true);
  };

  const sizesData = Object.entries(dashes) as Array<
    [DashStyle, [JSX.Element, string]]
  >;

  const renderedSwatches = sizesData
    .filter(([key]) => {
      return key !== DashStyle.Solid;
    })
    .map(([key, [icon, label]]) => {
      return (
        <Flex
          mx={1}
          my={1}
          key={key}
          width="3rem"
          height="2.5rem"
          cursor="pointer"
          onClick={() => handleSizePick(key)}
          align="center"
          justify="center"
          border="1px"
          borderColor="whiteAlpha.400"
          background="whiteAlpha.200"
          boxSizing="border-box"
        >
          <Tooltip label={label}>
            <Box>{icon}</Box>
          </Tooltip>
        </Flex>
      );
    });

  return (
    <Popover placement="right" isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <PopoverTrigger>
        <Flex
          width="2rem"
          height="2rem"
          cursor="pointer"
          background="black"
          align="center"
          justifyContent="center"
          border="1px"
          borderColor="whiteAlpha.400"
          onClick={handleOpen}
        >
          {dashes[currentStyle.dash][0]}
        </Flex>
      </PopoverTrigger>
      <PopoverContent width={`${sizesData.length * 2.5}rem`}>
        <PopoverArrow />
        <PopoverBody backgroundColor="black">
          <Flex my={-1} mx={-1}>
            {renderedSwatches}
          </Flex>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
