import {
  useRef,
  useEffect,
  useState,
  useLayoutEffect,
  useCallback,
} from 'react';

import { css } from '@emotion/react';

import { useThrottle } from '@react-hook/throttle';

import {
  Box,
  Flex,
  Heading,
  IconButton,
  Text,
  Tooltip,
} from '@chakra-ui/react';

import {
  PlayerPlay as PlayerPlayIcon,
  PlayerPause as PlayerPauseIcon,
  Maximize as MaximizeIcon,
} from 'tabler-icons-react';

import { TldrawApp } from '@tldraw/tldraw';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import usePanZoom from 'use-pan-and-zoom';
import { useHotkeys } from 'react-hotkeys-hook';
import { getRatioDimensions } from '../services/layout';
import useVideoStore from '../services/stores/videos';
import useSettingsStore from '../services/stores/settings';

import Drawing from '../components/Drawing/Drawing';
import DrawingControls from '../components/DrawingControls/DrawingControls';
import GlobalTimeControl from '../components/GlobalTimeControl/GlobalTimeControl';
import GlobalTimeDisplay from '../components/GlobalTimeDisplay/GlobalTimeDisplay';
import Hotkeys from './ReviewVideos/Hotkeys';
import PlaybackSpeed from '../components/PlaybackSpeed/PlaybackSpeed';
import ReviewVideosBanner from '../components/ReviewVideosBanner/ReviewVideosBanner';
import VideoBookmark from '../components/VideoBookmarkShow/VideoBookmarkShow';
import VideoBookmarkAdd from '../components/VideoBookmarkAdd/VideoBookmarkAdd';
import VideoStepControl from '../components/VideoStepControl/VideoStepControl';
import VideoThumbnail from '../components/VideoThumbnail/VideoThumbnail';
import VideoVolume from '../components/VideoVolume/VideoVolume';
import WithSidebar from '../layouts/WithSidebar';

export default function ReviewVideos() {
  const overlayRef = useRef(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const fullscreenTargetRef = useRef<HTMLDivElement | null>(null);
  const fullscreenTriggerRef = useRef<HTMLButtonElement | null>(null);

  const [startedPlayingAt, setStartedPlayingAt] = useState<number | null>(null);
  const [videoDimensions, setVideoDimensions] = useState<
    [number, number] | null
  >(null);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [mouseLastActive, setMouseLastActive] = useThrottle<number | null>(
    null,
    10,
    true
  );
  const [controlsOn, setControlsOn] = useState<boolean>(false);
  const [playerHeaderOn, setPlayerHeaderOn] = useState<boolean>(false);
  const [app, setApp] = useState<TldrawApp>();

  const startPlaying = useVideoStore((state) => state.startPlaying);
  const stopPlaying = useVideoStore((state) => state.stopPlaying);
  const setCurrentTime = useVideoStore((state) => state.setCurrentTime);

  const activeVideoId = useVideoStore((state) => state.activeVideoId);
  const currentTime = useVideoStore((state) => state.currentTime);
  const editingBookmark = useVideoStore((state) => state.editingBookmark);
  const overrideHideControls = useVideoStore(
    (state) => state.overrideHideControls
  );
  const playbackSpeed = useVideoStore((state) => state.playbackSpeed);
  const playing = useVideoStore((state) => state.playing);
  const videos = useVideoStore((state) => state.videos);

  const zoomPanEnabled = useSettingsStore((state) => state.zoomPanEnabled);

  const { panZoomHandlers, setContainer, setPan, setZoom, transform, zoom } =
    usePanZoom({
      disableWheel: true, // zoomPanEnabled === false,
      minZoom: 1,
    });

  const activeVideo = videos.find((video) => {
    return activeVideoId === video.id;
  });

  const activeBookmark = !activeVideo
    ? undefined
    : activeVideo.bookmarks.find((bookmark) => {
        return bookmark.time === currentTime;
      });

  // True when the active video has exceded its viewable range
  const isAfterRange =
    (activeVideo &&
      activeVideo.durationNormalised &&
      currentTime >= activeVideo.durationNormalised) ||
    false;

  function handleClickStep(distance: number) {
    stopPlaying();
    setCurrentTime(useVideoStore.getState().currentTime + distance); // HACK HACK - why does it have to read directly from the state here??
  }

  /**
   * Reset zoom / pan bounds
   */
  useHotkeys(
    'x',
    () => {
      setZoom(0);
      setPan({ x: 0, y: 0 });
    },
    {
      keyup: true,
    },
    []
  );

  const updateCurrentTime = useCallback(() => {
    if (startedPlayingAt === null) {
      return;
    }

    // HACK HACK - We should use something where we have control over the clock driving the video (i.e. gstreamer)
    setCurrentTime(
      currentTime +
        ((Date.now() - startedPlayingAt) / 1000 - 0.06) * playbackSpeed
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedPlayingAt, setCurrentTime, playbackSpeed]);

  /**
   * Stop the video playing when leaving
   */
  useEffect(() => {
    return () => {
      stopPlaying();
    };
  }, [stopPlaying]);

  /**
   * Handles mounting the videos into the main playing area.
   */
  useEffect(() => {
    if (
      activeVideo === undefined ||
      activeVideo.el === null ||
      videoContainerRef.current === null
    ) {
      return;
    }

    videoContainerRef.current.innerHTML = '';
    videoContainerRef.current.appendChild(activeVideo.el);

    activeVideo.el.volume = activeVideo.volume;
  }, [activeVideo]);

  // when we start playing, store the time that play started
  useEffect(() => {
    if (playing === false) {
      setStartedPlayingAt(null);
      return;
    }

    setStartedPlayingAt(Date.now());
  }, [playing]);

  // when we have a time we started playing at, start a click to update the current time
  useEffect(() => {
    const timer = setInterval(updateCurrentTime, 500);

    return () => {
      updateCurrentTime();
      clearInterval(timer);
    };
  }, [updateCurrentTime]);

  // watch for fullscreen being set and trigger
  useEffect(() => {
    if (fullscreen === null) {
      return;
    }

    if (fullscreen === true) {
      (async () => {
        if (fullscreenTargetRef.current === null) {
          return;
        }

        await fullscreenTargetRef.current.requestFullscreen();

        if (fullscreenTriggerRef.current) {
          fullscreenTriggerRef.current.blur();
        }

        window.dispatchEvent(new Event('resize'));
      })();
    } else if (document.fullscreenElement) {
      (async () => {
        await document.exitFullscreen();

        if (fullscreenTriggerRef.current) {
          fullscreenTriggerRef.current.blur();
        }

        window.dispatchEvent(new Event('resize'));
      })();
    }
  }, [fullscreen]);

  // watch for the video element being resized and adjust accordingly
  useLayoutEffect(() => {
    const handleResize = () => {
      if (overlayRef.current === null || activeVideo === undefined) {
        return;
      }

      const dimensions = getRatioDimensions(
        activeVideo.displayAspectRatio,
        overlayRef.current
      );

      setVideoDimensions(dimensions);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeVideo]);

  /**
   * Triggers a resize event on load of the element, required to be deferred
   * using the `setTimeout` to ensure the video element has finished loading
   * and has dimensions.
   */
  useLayoutEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }, []);

  /**
   * Watch for the mouse being active and set a deactivation if it stops moving
   */
  useLayoutEffect(() => {
    if (mouseLastActive === null) {
      return undefined;
    }

    window.dispatchEvent(new Event('resize'));

    const timeout = setTimeout(() => {
      setMouseLastActive(null);
    }, 750);

    return () => {
      clearTimeout(timeout);
    };
  }, [mouseLastActive, setMouseLastActive]);

  // When changing between active videos, show the controls for some time
  useEffect(() => {
    setPlayerHeaderOn(true);

    const timer = setTimeout(() => {
      setPlayerHeaderOn(false);
    }, 1500);

    window.dispatchEvent(new Event('resize'));

    return () => {
      clearInterval(timer);
    };
  }, [activeVideoId, setPlayerHeaderOn]);

  /**
   * The scale of how much the current video has been reduced in size. If no
   * video has been loaded, we default to 1. If a video has been loaded,
   * determine how much smaller it is compared to its native resolution. This
   * only takes into account width scaling.
   */
  const scale =
    !videoDimensions || !activeVideo
      ? 1
      : videoDimensions[0] / activeVideo.codedWidth;

  const showControls =
    editingBookmark === true ||
    (overrideHideControls === false &&
      (mouseLastActive !== null || controlsOn === true));

  const overlayStyle = css`
    width: ${videoDimensions ? videoDimensions[0] : ''}px;
    height: ${videoDimensions ? videoDimensions[1] : ''}px;
    cursor: ${playing === true && showControls === false ? 'none' : 'auto'};
  `;

  const videoStyle = css`
    video {
      width: ${videoDimensions ? videoDimensions[0] : ''}px;
      height: ${videoDimensions ? videoDimensions[1] : ''}px;
    }
  `;

  /**
   * Selectable videos used in the sidebar
   */
  const renderedSidebarVideos = videos.map((video) => {
    return <VideoThumbnail key={video.id} video={video} />;
  });

  const renderedSidebar = (
    <Flex
      direction="column"
      height="calc(100vh - 5rem)"
      justifyContent="space-evenly"
    >
      {renderedSidebarVideos}
    </Flex>
  );

  /**
   * Drawing control palette
   */
  const renderedDrawingControls = app !== undefined &&
    showControls === true && (
      <Flex
        align="center"
        bottom={0}
        justify="center"
        left={0}
        pointerEvents="none"
        position="absolute"
        top={0}
        zIndex={2}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Box
            background="gray.900"
            borderColor="whiteAlpha.500"
            borderLeft="none"
            borderWidth="1px"
            boxSizing="border-box"
            onMouseEnter={() => setControlsOn(true)}
            onMouseLeave={() => setControlsOn(false)}
            padding={4}
            pointerEvents="all"
          >
            <DrawingControls app={app} />
          </Box>
        </motion.div>
      </Flex>
    );

  /**
   * Main content for the page
   */
  const renderedContent = (() => {
    if (videos.length === 0) {
      return (
        <ReviewVideosBanner>
          <Link to="/">
            <Text>Please setup some videos first</Text>
          </Link>
        </ReviewVideosBanner>
      );
    }

    if (activeVideo === undefined) {
      return (
        <ReviewVideosBanner>
          <Text>Please choose a video</Text>
        </ReviewVideosBanner>
      );
    }

    /**
     * Header used at the top of the screen. Contains the players name.
     */
    const renderedHeader = videoDimensions !== null &&
      (showControls === true || playerHeaderOn) && (
        <Flex
          alignItems="center"
          boxSizing="border-box"
          justify="center"
          left={0}
          pointerEvents="none"
          position="absolute"
          right={0}
          top={0}
          zIndex={2}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Box
              background="gray.900"
              borderColor="whiteAlpha.500"
              borderTop="none"
              borderWidth="1px"
              onMouseEnter={() => setControlsOn(true)}
              onMouseLeave={() => setControlsOn(false)}
              p={4}
              pointerEvents="all"
            >
              <Heading fontSize="xl">{activeVideo.name}</Heading>
            </Box>
          </motion.div>
        </Flex>
      );

    const renderedDrawing = (
      <Drawing
        onMount={(innerApp) => setApp(innerApp)}
        scale={scale}
        video={activeVideo}
        videoBookmark={activeBookmark}
      />
    );

    const renderedActiveBookmark = activeBookmark !== undefined && (
      <VideoBookmark
        video={activeVideo}
        bookmark={activeBookmark}
        scale={scale}
      />
    );

    const renderedVideoEnded = isAfterRange &&
      activeVideo.durationNormalised && (
        <Flex
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor="gray.800"
          align="center"
          justifyContent="center"
          shadow="outline"
        >
          Finished{' '}
          {Math.round(Math.abs(activeVideo.durationNormalised - currentTime))}s
          ago
        </Flex>
      );

    const renderedNavigationControls = showControls === true && (
      <Flex
        align="center"
        bottom={0}
        boxSizing="border-box"
        justify="center"
        left={0}
        onMouseEnter={() => setControlsOn(true)}
        onMouseLeave={() => setControlsOn(false)}
        position="absolute"
        right={0}
        zIndex={2}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Flex
            align="center"
            background="gray.900"
            borderBottom="none"
            borderColor="whiteAlpha.500"
            borderWidth="1px"
            minWidth="50vw"
            p={4}
            pointerEvents="all"
          >
            <Tooltip label={playing ? 'Pause' : 'Play'}>
              <Box mr="2">
                {!playing && (
                  <IconButton
                    onClick={startPlaying}
                    icon={<PlayerPlayIcon />}
                    aria-label="Play"
                    disabled={isAfterRange}
                  />
                )}
                {playing && (
                  <IconButton
                    onClick={stopPlaying}
                    icon={<PlayerPauseIcon />}
                    aria-label="Pause"
                  />
                )}
              </Box>
            </Tooltip>

            <Box mx={2}>
              <PlaybackSpeed disabled={playing} />
            </Box>

            <Box mx="2">
              <VideoStepControl
                direction="backwards"
                frameRate={activeVideo.frameRate}
                onClick={(value) => handleClickStep(value)}
                pause={activeVideo.seeking}
              />
            </Box>

            <Box mx="2">
              <GlobalTimeDisplay />
            </Box>

            <Box flexGrow={1} mx="2" minW="25vw">
              <GlobalTimeControl video={activeVideo} />
            </Box>

            <Box mx="2">
              <VideoVolume video={activeVideo} />
            </Box>

            <Box mx="2">
              <VideoStepControl
                direction="forwards"
                frameRate={activeVideo.frameRate}
                onClick={(value) => handleClickStep(value)}
                pause={activeVideo.seeking}
              />
            </Box>

            {app && (
              <Box mx="2">
                <VideoBookmarkAdd
                  app={app}
                  disabled={!!activeBookmark || editingBookmark || isAfterRange}
                  scale={scale}
                  video={activeVideo}
                />
              </Box>
            )}

            <Tooltip label="Presentation mode">
              <Box ml="2">
                <IconButton
                  onClick={() => setFullscreen(!fullscreen)}
                  icon={<MaximizeIcon />}
                  aria-label="Fullscreen video"
                  disabled={isAfterRange}
                  ref={fullscreenTriggerRef}
                />
              </Box>
            </Tooltip>
          </Flex>
        </motion.div>
      </Flex>
    );

    const updatedPanZoomHandlers = zoomPanEnabled
      ? {
          ...panZoomHandlers,
          onWheel: (event: WheelEvent) => {
            if (event.deltaY < 0) {
              setZoom(zoom + 1);
            } else {
              setZoom(zoom - 1);
            }
          },
        }
      : {};

    return (
      <Flex
        direction="column"
        width="100%"
        height="calc(100vh - 5rem)"
        ref={fullscreenTargetRef}
        onMouseMove={() => setMouseLastActive(Date.now())}
      >
        <Flex flexGrow={1} flexShrink={1} overflow="hidden" position="relative">
          <AnimatePresence>{renderedHeader}</AnimatePresence>
          <AnimatePresence>{renderedDrawingControls}</AnimatePresence>
          <AnimatePresence>{renderedNavigationControls}</AnimatePresence>
          <Flex
            align="center"
            flexGrow={1}
            flexShrink={1}
            justifyContent="center"
            ref={overlayRef}
            overflow="hidden"
          >
            <Box
              position="relative"
              css={overlayStyle}
              id="overlay"
              ref={setContainer}
              style={{ touchAction: 'none' }}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...updatedPanZoomHandlers}
            >
              {zoomPanEnabled === false && renderedDrawing}
              {renderedActiveBookmark}
              {renderedVideoEnded}
              <Box
                css={videoStyle}
                ref={videoContainerRef}
                style={{ transform }}
              />
            </Box>
          </Flex>
        </Flex>
      </Flex>
    );
  })();

  return (
    <>
      {activeVideo !== undefined && (
        <Hotkeys onEscape={() => setFullscreen(false)} video={activeVideo} />
      )}
      <WithSidebar sidebar={renderedSidebar} disableSidebar={videos.length < 2}>
        {renderedContent}
      </WithSidebar>
    </>
  );
}
