import * as React from 'react';

import { css } from '@emotion/react';

import useStore from '../../services/store';

import DrawingControlsColorSelector from '../DrawingControlsColorSelector/DrawingControlsColorSelector';
import DrawingControlsSizeSelector from '../DrawingControlsSizeSelector/DrawingControlsSizeSelector';

import { Flex, Box, VStack, IconButton, Tooltip } from '@chakra-ui/react';
import { TDShapeType, TDToolType, TldrawApp } from '@tldraw/tldraw';

import {
  Click as ClickIcon,
  Pencil as PencilIcon,
  Eraser as EraserIcon,
  ArrowUpRight as ArrowUpRightIcon,
  Rectangle as RectangleIcon,
  Circle as CircleIcon,
} from 'tabler-icons-react';

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
  const playing = useStore((state) => state.playing);

  function selectTool(tool: TDToolType) {
    app.selectTool(tool);
  }

  React.useEffect(() => {
    if (playing === true) {
      selectTool('select');
    }
  }, [playing]);

  return (
    <>
      <Box>
        <VStack spacing={4}>
          <Tooltip label="Select" aria-label="Select">
            <IconButton
              icon={<ClickIcon />}
              disabled={playing}
              aria-label="Select"
              css={activeTool === 'select' ? selectedStyle : unSlectedStyle}
              onClick={() => selectTool('select')}
            />
          </Tooltip>
          <Tooltip label="Pencil" aria-label="Pencil">
            <IconButton
              icon={<PencilIcon />}
              disabled={playing}
              aria-label="Pencil"
              css={
                activeTool === TDShapeType.Draw ? selectedStyle : unSlectedStyle
              }
              onClick={() => selectTool(TDShapeType.Draw)}
            />
          </Tooltip>
          <Tooltip label="Arrow" aria-label="Arrow">
            <IconButton
              icon={<ArrowUpRightIcon />}
              disabled={playing}
              aria-label="Arrow"
              css={
                activeTool === TDShapeType.Arrow
                  ? selectedStyle
                  : unSlectedStyle
              }
              onClick={() => selectTool(TDShapeType.Arrow)}
            />
          </Tooltip>
          <Tooltip label="Rectangle" aria-label="Rectangle">
            <IconButton
              icon={<RectangleIcon />}
              disabled={playing}
              aria-label="Rectangle"
              css={
                activeTool === TDShapeType.Rectangle
                  ? selectedStyle
                  : unSlectedStyle
              }
              onClick={() => selectTool(TDShapeType.Rectangle)}
            />
          </Tooltip>
          <Tooltip label="Ellipse" aria-label="Ellipse">
            <IconButton
              icon={<CircleIcon />}
              disabled={playing}
              aria-label="Ellipse"
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
        borderTop={'1px'}
        borderColor={'whiteAlpha.300'}
        justify={'center'}
      >
        <Box>
          <Box>
            <DrawingControlsColorSelector app={app} />
          </Box>
          <Box mt={4}>
            <DrawingControlsSizeSelector app={app} />
          </Box>
        </Box>
      </Flex>
    </>
  );
}
