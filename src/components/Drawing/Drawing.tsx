import useStore from "../../services/store";

import { useRef, useLayoutEffect, useState, useEffect } from "react";
import { Tldraw, TldrawApp } from "@tldraw/tldraw";

import { Box } from "@chakra-ui/react";

import type { Video } from "../../services/models/Video";
import type { VideoBookmark } from "../../services/models/VideoBookmark";

type Props = {
  fullscreen: boolean;
  scale: number;
  showUI: boolean;
  video: Video;
  videoBookmark: VideoBookmark | undefined;
};

export default function Drawing({
  fullscreen,
  scale,
  showUI,
  video,
  videoBookmark,
}: Props) {
  const tlDrawRef = useRef(null);
  const outerRef = useRef(null);

  const setVideoBookmarkDrawing = useStore(
    (state) => state.setVideoBookmarkDrawing
  );

  console.log(scale);

  function handleMount(app: TldrawApp) {
    tlDrawRef.current = app;

    if (videoBookmark && videoBookmark.drawing) {
      tlDrawRef.current.loadDocument(
        JSON.parse(JSON.stringify(videoBookmark.drawing)) // we need to load a copy of the document
      );

      tlDrawRef.current.selectNone();
    }

    tlDrawRef.current.setCamera([0, 0], scale, "layout_mounted");
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

  return (
    <Box
      position="absolute"
      top={"0"}
      left={"0"}
      right={"0"}
      bottom={"0"}
      ref={outerRef}
    >
      {!showUI && (
        <Box
          position="absolute"
          top={"0"}
          left={"0"}
          right={"0"}
          bottom={"0"}
          zIndex={2}
        />
      )}
      <Tldraw
        onMount={handleMount}
        onPersist={handlePersist}
        showMenu={false}
        showPages={false}
        showStyles={fullscreen === false}
        showZoom={false}
        showUI={showUI}
      />
    </Box>
  );
}
