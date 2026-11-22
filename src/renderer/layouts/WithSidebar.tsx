import { Box, Flex } from '@chakra-ui/react';

import { css } from '@emotion/react';
import { useThrottleCallback } from '@react-hook/throttle';
import * as React from 'react';
import Draggable, { type DraggableEvent } from 'react-draggable';
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

  // Let anything sized from the window (the videos) re-measure, at most 10
  // times a second while the sidebar is dragged.
  const dispatchResize = useThrottleCallback(() => {
    window.dispatchEvent(new Event('resize'));
  }, 10);

  const mainWidth = window.innerWidth - sidebarWidth;

  const sidebarStyles = css`
    display: ${disableSidebar === true ? 'none' : 'block'};
  `;

  const handleDrag = (event: DraggableEvent) => {
    // The sidebar handle is only dragged with a mouse.
    if (!('clientX' in event)) return;
    const newWidth = window.innerWidth - event.clientX;
    setSidebarWidth(newWidth);
    dispatchResize();
  };

  const handleDragStop = () => {
    window.dispatchEvent(new Event('resize'));
  };

  React.useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

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
