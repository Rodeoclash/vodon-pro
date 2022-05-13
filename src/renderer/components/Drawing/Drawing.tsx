import { useRef, useEffect, useCallback } from 'react';
import { Tldraw, TldrawApp, ColorStyle } from '@tldraw/tldraw';

import { Box } from '@chakra-ui/react';
import useVideoStore from '../../services/stores/videos';
import useSettingsStore from '../../services/stores/settings';

import type { Video } from '../../services/models/Video';
import type { VideoBookmark } from '../../services/models/VideoBookmark';

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
  const tlDrawRef = useRef<TldrawApp | null>(null);
  const outerRef = useRef(null);

  const playing = useVideoStore((state) => state.playing);

  const setVideoBookmarkDrawing = useVideoStore(
    (state) => state.setVideoBookmarkDrawing
  );

  const clearDrawingsOnPlay = useSettingsStore(
    (state) => state.clearDrawingsOnPlay
  );

  function handleMount(app: TldrawApp) {
    tlDrawRef.current = app;
    tlDrawRef.current.setCamera([0, 0], scale, 'layout_mounted');
    tlDrawRef.current.style({ color: ColorStyle.Red });
    onMount(app);
  }

  function handlePersist(app: TldrawApp) {
    if (videoBookmark === undefined || playing === true) {
      return;
    }

    setVideoBookmarkDrawing(video, videoBookmark, app.document);
  }

  const clearDrawing = useCallback(() => {
    if (tlDrawRef.current === null) {
      return;
    }

    const tool = tlDrawRef.current.useStore.getState().appState.activeTool;
    tlDrawRef.current.deleteAll();
    tlDrawRef.current.selectTool(tool);
  }, []);

  const rescaleDrawing = useCallback(() => {
    if (tlDrawRef.current === null) {
      return;
    }

    tlDrawRef.current.setCamera([0, 0], scale, 'layout_resized');
  }, [scale]);

  /**
   * Rescale drawing as parent scales
   */
  useEffect(() => {
    rescaleDrawing();
  }, [scale, rescaleDrawing]);

  /**
   * Load video bookmarks
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
      rescaleDrawing();
    } else {
      clearDrawing();
    }
  }, [clearDrawing, rescaleDrawing, videoBookmark]);

  /**
   * Clear drawings between time changes if enabled
   */
  useEffect(() => {
    if (tlDrawRef.current === null) {
      return;
    }

    if (clearDrawingsOnPlay === true && playing === true) {
      clearDrawing();
    }
  }, [playing, clearDrawingsOnPlay, clearDrawing]);

  return (
    <Box
      position="absolute"
      top="0"
      left="0"
      right="0"
      bottom="0"
      ref={outerRef}
    >
      <Tldraw
        onMount={(app) => handleMount(app)}
        onPersist={(app) => handlePersist(app)}
        showUI={false}
      />
    </Box>
  );
}
