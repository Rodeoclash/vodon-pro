import useStore from "../../services/store";

import { useRef, useEffect } from "react";
import { Tldraw, TldrawApp } from "@tldraw/tldraw";

import { Box } from "@chakra-ui/react";

import type { Video } from "../../services/models/Video";
import type { VideoBookmark } from "../../services/models/VideoBookmark";

type Props = {
  onMount: (app: TldrawApp) => void;
  scale: number;
  video: Video;
  videoBookmark: VideoBookmark | undefined;
};

export default function Drawing({
  onMount,
  scale,
  video,
  videoBookmark,
}: Props) {
  const tlDrawRef = useRef<TldrawApp>(null);
  const outerRef = useRef(null);

  const currentTime = useStore((state) => state.currentTime);

  const setVideoBookmarkDrawing = useStore(
    (state) => state.setVideoBookmarkDrawing
  );

  function handleMount(app: TldrawApp) {
    tlDrawRef.current = app;
    tlDrawRef.current.setCamera([0, 0], scale, "layout_mounted");
    onMount(app);
  }

  function handlePersist(app: TldrawApp) {
    if (videoBookmark) {
      setVideoBookmarkDrawing(video, videoBookmark, app.document);
    }
  }

  useEffect(() => {
    if (tlDrawRef.current === null) {
      return;
    }

    tlDrawRef.current.setCamera([0, 0], scale, "layout_resized");
  }, [scale]);

  /**
   * On the current time / active bookmark changing, handle updating the
   * drawing
   */
  useEffect(() => {
    if (tlDrawRef.current === null) {
      return;
    }

    if (videoBookmark?.drawing) {
      tlDrawRef.current.loadDocument(
        JSON.parse(JSON.stringify(videoBookmark.drawing)) // we need to load a copy of the document
      );

      tlDrawRef.current.selectNone();
    } else {
      const tool = tlDrawRef.current.useStore.getState().appState.activeTool;
      tlDrawRef.current.deleteAll();
      tlDrawRef.current.selectTool(tool);
    }

    tlDrawRef.current.setCamera([0, 0], scale, "layout_mounted");
  }, [currentTime, videoBookmark]);

  return (
    <Box
      position="absolute"
      top={"0"}
      left={"0"}
      right={"0"}
      bottom={"0"}
      ref={outerRef}
    >
      <Tldraw onMount={handleMount} onPersist={handlePersist} showUI={false} />
    </Box>
  );
}
