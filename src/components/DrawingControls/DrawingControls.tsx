import { css } from "@emotion/react";

import DrawingControlsColorSelector from "../DrawingControlsColorSelector/DrawingControlsColorSelector";

import { Flex, Box, VStack, IconButton, Tooltip } from "@chakra-ui/react";
import { TDShapeType, TldrawApp, ColorStyle } from "@tldraw/tldraw";

import {
  Click as ClickIcon,
  Pencil as PencilIcon,
  Eraser as EraserIcon,
  ArrowUpRight as ArrowUpRightIcon,
  Rectangle as RectangleIcon,
  Circle as CircleIcon,
} from "tabler-icons-react";

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

  return (
    <>
      <Box>
        <VStack spacing={4}>
          <Tooltip label="Select" aria-label="Select">
            <IconButton
              icon={<ClickIcon />}
              aria-label="Select"
              css={activeTool === "select" ? selectedStyle : unSlectedStyle}
              onClick={() => app.selectTool("select")}
            />
          </Tooltip>
          <Tooltip label="Pencil" aria-label="Pencil">
            <IconButton
              icon={<PencilIcon />}
              aria-label="Pencil"
              css={
                activeTool === TDShapeType.Draw ? selectedStyle : unSlectedStyle
              }
              onClick={() => app.selectTool(TDShapeType.Draw)}
            />
          </Tooltip>
          <Tooltip label="Arrow" aria-label="Arrow">
            <IconButton
              icon={<ArrowUpRightIcon />}
              aria-label="Arrow"
              css={
                activeTool === TDShapeType.Arrow
                  ? selectedStyle
                  : unSlectedStyle
              }
              onClick={() => app.selectTool(TDShapeType.Arrow)}
            />
          </Tooltip>
          <Tooltip label="Rectangle" aria-label="Rectangle">
            <IconButton
              icon={<RectangleIcon />}
              aria-label="Rectangle"
              css={
                activeTool === TDShapeType.Rectangle
                  ? selectedStyle
                  : unSlectedStyle
              }
              onClick={() => app.selectTool(TDShapeType.Rectangle)}
            />
          </Tooltip>
          <Tooltip label="Ellipse" aria-label="Ellipse">
            <IconButton
              icon={<CircleIcon />}
              aria-label="Ellipse"
              css={
                activeTool === TDShapeType.Ellipse
                  ? selectedStyle
                  : unSlectedStyle
              }
              onClick={() => app.selectTool(TDShapeType.Ellipse)}
            />
          </Tooltip>
        </VStack>
      </Box>
      <Flex
        mt={4}
        pt={4}
        borderTop={"1px"}
        borderColor={"whiteAlpha.300"}
        justifyContent="center"
      >
        <DrawingControlsColorSelector app={app} />
      </Flex>
    </>
  );
}
