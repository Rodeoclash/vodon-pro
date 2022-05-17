import * as React from 'react';

import { css } from '@emotion/react';
import { useThrottle } from '@react-hook/throttle';

import { Flex, Box } from '@chakra-ui/react';
import Draggable from 'react-draggable';
import useSettingsStore from '../services/stores/settings';

interface Props {
  children: React.ReactNode;
  disableSidebar: boolean;
  sidebar: React.ReactNode;
}

export default function WithSidebar({
  children,
  sidebar,
  disableSidebar = false,
}: Props) {
  const sidebarWidth = useSettingsStore((state) => state.sidebarWidth);
  const setSidebarWidth = useSettingsStore((state) => state.setSidebarWidth);

  const [resizeLastAt, setResizeLastAt] = useThrottle<number | null>(null, 10);

  const mainWidth = window.innerWidth - sidebarWidth;

  const sidebarStyles = css`
    display: ${disableSidebar === true ? 'none' : 'block'};
  `;

  const handleDrag = (event: any) => {
    const newWidth = window.innerWidth - event.clientX;
    setSidebarWidth(newWidth);
    setResizeLastAt(Date.now());
  };

  const handleDragStop = () => {
    window.dispatchEvent(new Event('resize'));
  };

  React.useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [resizeLastAt]);

  return (
    <Flex width="100%">
      <Box bgColor="black" flexGrow={1} width={mainWidth}>
        {children}
      </Box>
      <Box
        css={sidebarStyles}
        width={sidebarWidth}
        boxSizing="border-box"
        borderLeft="1px"
        borderColor="whiteAlpha.300"
        position="relative"
        flexShrink={1}
      >
        <Draggable
          axis="x"
          onDrag={(event) => handleDrag(event)}
          onStop={() => handleDragStop()}
          position={{ x: 0, y: 0 }}
        >
          <Box
            backgroundColor="transparent"
            bottom="0"
            cursor="ew-resize"
            left="-1rem"
            position="absolute"
            top="0"
            width="2rem"
            zIndex={3}
          />
        </Draggable>
        {sidebar}
      </Box>
    </Flex>
  );
}
