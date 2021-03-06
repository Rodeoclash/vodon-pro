import * as React from 'react';

import {
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
} from '@chakra-ui/react';
import { TldrawApp, SizeStyle } from '@tldraw/tldraw';

type PropsType = {
  app: TldrawApp;
};

const sizes = {
  [SizeStyle.Small]: 'S',
  [SizeStyle.Medium]: 'M',
  [SizeStyle.Large]: 'L',
};

export default function DrawingControlsSizeSelector({ app }: PropsType) {
  const [isOpen, setIsOpen] = React.useState(false);

  const currentStyle = app.useStore((s) => s.appState.currentStyle);

  const handleSizePick = React.useCallback(
    (size: SizeStyle) => {
      app.style({ size });
      setIsOpen(false);
    },
    [app]
  );

  const handleOpen = () => {
    setIsOpen(true);
  };

  const sizesData = Object.entries(sizes) as Array<[SizeStyle, string]>;

  const renderedSwatches = sizesData.map(([key, value]) => {
    return (
      <Flex
        mx={1}
        my={1}
        key={key}
        width="1.5rem"
        height="1.5rem"
        cursor="pointer"
        onClick={() => handleSizePick(key)}
        align="center"
        justify="center"
        border="1px"
        borderColor="whiteAlpha.400"
        background="whiteAlpha.200"
        padding="1rem"
      >
        {value}
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
          {sizes[currentStyle.size].slice(0, 1).toUpperCase()}
        </Flex>
      </PopoverTrigger>
      <PopoverContent width={`${sizesData.length * 3}rem`}>
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
