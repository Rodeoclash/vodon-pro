import * as React from 'react';

import { css } from '@emotion/react';
import { useHotkeys } from 'react-hotkeys-hook';

import { Flex, Box, VStack, IconButton, Tooltip } from '@chakra-ui/react';
import { TDShapeType, TDToolType, TldrawApp } from '@tldraw/tldraw';
import {
  ArrowUpRight as ArrowUpRightIcon,
  Circle as CircleIcon,
  Click as ClickIcon,
  Line as LineIcon,
  Pencil as PencilIcon,
  Rectangle as RectangleIcon,
  Trash as TrashIcon,
} from 'tabler-icons-react';

import DrawingControlsColorSelector from '../DrawingControlsColorSelector/DrawingControlsColorSelector';
import DrawingControlsSizeSelector from '../DrawingControlsSizeSelector/DrawingControlsSizeSelector';
import DrawingControlsDashSelector from '../DrawingControlsDashSelector/DrawingControlsDashSelector';

type PropsType = {
  app: TldrawApp;
};

const selectedStyle = css`
  opacity: 1;
`;

const unSlectedStyle = css`
  opacity: 0.5;
`;

export default function DrawingControls({ app }: PropsType) {
  const activeTool = app.useStore((s) => s.appState.activeTool);

  const selectTool = React.useCallback(
    (type: TDToolType) => {
      app.selectTool(type);
      app.toggleToolLock();
    },
    [app]
  );

  useHotkeys(
    'p',
    () => {
      selectTool(TDShapeType.Draw);
    },
    {
      keydown: true,
    },
    [selectTool]
  );

  useHotkeys(
    'r',
    () => {
      selectTool(TDShapeType.Arrow);
    },
    {
      keydown: true,
    },
    [selectTool]
  );

  useHotkeys(
    'l',
    () => {
      selectTool(TDShapeType.Line);
    },
    {
      keydown: true,
    },
    [selectTool]
  );

  useHotkeys(
    'b',
    () => {
      selectTool(TDShapeType.Rectangle);
    },
    {
      keydown: true,
    },
    [selectTool]
  );

  useHotkeys(
    'c',
    () => {
      selectTool(TDShapeType.Ellipse);
    },
    {
      keydown: true,
    },
    [selectTool]
  );

  useHotkeys(
    't',
    () => {
      app.deleteAll();
    },
    {
      keydown: true,
    },
    [selectTool]
  );

  return (
    <>
      <Box>
        <VStack spacing={4}>
          <Tooltip label="Select" aria-label="Select">
            <IconButton
              icon={<ClickIcon />}
              aria-label="Select"
              css={activeTool === 'select' ? selectedStyle : unSlectedStyle}
              onClick={() => selectTool('select')}
            />
          </Tooltip>
          <Tooltip label="Pencil (P)" aria-label="Pencil (P)">
            <IconButton
              icon={<PencilIcon />}
              aria-label="Pencil"
              css={
                activeTool === TDShapeType.Draw ? selectedStyle : unSlectedStyle
              }
              onClick={() => selectTool(TDShapeType.Draw)}
            />
          </Tooltip>
          <Tooltip label="Arrow (R)" aria-label="Arrow (R)">
            <IconButton
              icon={<ArrowUpRightIcon />}
              aria-label="Arrow"
              css={
                activeTool === TDShapeType.Arrow
                  ? selectedStyle
                  : unSlectedStyle
              }
              onClick={() => selectTool(TDShapeType.Arrow)}
            />
          </Tooltip>
          <Tooltip label="Line (L)" aria-label="Line (L)">
            <IconButton
              icon={<LineIcon />}
              aria-label="Line"
              css={
                activeTool === TDShapeType.Line ? selectedStyle : unSlectedStyle
              }
              onClick={() => selectTool(TDShapeType.Line)}
            />
          </Tooltip>
          <Tooltip label="Box (B)" aria-label="Box (B)">
            <IconButton
              icon={<RectangleIcon />}
              aria-label="Box"
              css={
                activeTool === TDShapeType.Rectangle
                  ? selectedStyle
                  : unSlectedStyle
              }
              onClick={() => selectTool(TDShapeType.Rectangle)}
            />
          </Tooltip>
          <Tooltip label="Circle (C)" aria-label="Circle (C)">
            <IconButton
              icon={<CircleIcon />}
              aria-label="Circle"
              css={
                activeTool === TDShapeType.Ellipse
                  ? selectedStyle
                  : unSlectedStyle
              }
              onClick={() => selectTool(TDShapeType.Ellipse)}
            />
          </Tooltip>
        </VStack>
      </Box>
      <Flex
        mt={4}
        pt={4}
        borderTop="1px"
        borderColor="whiteAlpha.300"
        justify="center"
      >
        <Box>
          <Box>
            <DrawingControlsColorSelector app={app} />
          </Box>
          <Box mt={4}>
            <DrawingControlsSizeSelector app={app} />
          </Box>
          <Box mt={4}>
            <DrawingControlsDashSelector app={app} />
          </Box>
        </Box>
      </Flex>
      <Flex
        mt={4}
        pt={4}
        borderTop="1px"
        borderColor="whiteAlpha.300"
        justify="center"
      >
        <Tooltip label="Trash drawing (T)" aria-label="Trash drawing (T)">
          <Box>
            <IconButton
              icon={<TrashIcon />}
              aria-label="Arrow"
              css={selectedStyle}
              onClick={() => app.deleteAll()}
            />
          </Box>
        </Tooltip>
      </Flex>
    </>
  );
}
