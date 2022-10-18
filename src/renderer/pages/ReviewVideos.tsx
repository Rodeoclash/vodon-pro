import {
  useRef,
  useEffect,
  useState,
  useLayoutEffect,
  useCallback,
} from 'react';

import { css } from '@emotion/react';

import { useThrottle } from '@react-hook/throttle';
import { useBus } from 'react-bus';

import {
  Box,
  Flex,
  Heading,
  IconButton,
  Kbd,
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
import usePanZoom from 'use-pan-and-zoom';
import { useHotkeys } from 'react-hotkeys-hook';
import { isEqual } from 'lodash';
import { GLOBAL_TIME_CHANGE } from '../services/bus';
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
import VideoBookmarkShow from '../components/VideoBookmarkShow/VideoBookmarkShow';
import VideoBookmarkAdd from '../components/VideoBookmarkAdd/VideoBookmarkAdd';
import VideoStepControl from '../components/VideoStepControl/VideoStepControl';
import VideoThumbnail from '../components/VideoThumbnail/VideoThumbnail';
import VideoVolume from '../components/VideoVolume/VideoVolume';
import WithSidebar from '../layouts/WithSidebar';

import type { Video } from '../services/models/Video';

export type PreciseVideoTimes = {
  [id: string]: number;
};

export type SeenBookmarks = {
  [id: string]: boolean;
};

const UI_REFRESH_RATE = 100;

export default function ReviewVideos() {
  const bus = useBus();

  /**
   * Stores the current time of each of the videos. This is updated very
   * quickly so we don't want to store in a React state otherwise we will
   * trigger a huge number of repaints.
   *
   * For UI elements that depend on showing the current time, we use a
   * timer instead which refreshes at a slower rate (see constant
   * UI_REFRESH_RATE)
   */
  const videoTimes = useRef<PreciseVideoTimes>({});

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const fullscreenTargetRef = useRef<HTMLDivElement | null>(null);
  const fullscreenTriggerRef = useRef<HTMLButtonElement | null>(null);

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
  const [seenBookmarks, setSeenBookmarks] = useState<SeenBookmarks>({});

  const [app, setApp] = useState<TldrawApp>();

  const startPlaying = useVideoStore((state) => state.startPlaying);
  const stopPlaying = useVideoStore((state) => state.stopPlaying);
  const setCurrentTime = useVideoStore((state) => state.setCurrentTime);

  const activeVideoId = useVideoStore((state) => state.activeVideoId);
  const currentTime = useVideoStore((state) => state.currentTime);
  const editingBookmark = useVideoStore((state) => state.editingBookmark);
  const seeking = useVideoStore((state) => state.seeking);
  const overrideHideControls = useVideoStore(
    (state) => state.overrideHideControls
  );
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

  const activeVideoIndex = videos.findIndex((video) => {
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
    if (!activeVideo || !activeVideo.el) {
      return;
    }

    stopPlaying();
    const time =
      activeVideo.el.currentTime +
      distance +
      (activeVideo.offset ? activeVideo.offset : 0);
    bus.emit(GLOBAL_TIME_CHANGE, { time });
    setCurrentTime(time); // REMOVE ONCE GLOBAL TIME CALCULATED FROM CURRENT VIDEO
  }

  /**
   * Reset zoom / pan bounds
   */
  useHotkeys(
    'x',
    () => {
      setZoom(0);
      setPan({ x: 0, y: 0 });
      if (app) {
        app.deleteAll();
      }
    },
    {
      keyup: true,
    },
    [app]
  );

  /**
   * `currentTime` is a bit of a weird concept in the system. It's used mainly
   * to drive the UI elments (like the global progress bar) but also as the
   * value which is used to restore the position of the videos after the app
   * has been loaded again.
   *
   * Where possible, we use one of the values in `videoTimes` directly (which
   * are high resolution representations of the current time) - i.e. when
   * setting bookmarks etc.
   *
   * currentTime is set directly when doing things that need to feel responsive
   * (like clicking on the global progress bar).
   */
  const updateCurrentTime = useCallback(() => {
    if (!activeVideo || activeVideo.el.paused === true) {
      return;
    }

    const firstVideoTime = Object.values(videoTimes.current)[0];
    setCurrentTime(firstVideoTime);
  }, [activeVideo, setCurrentTime]);

  /**
   * Tracks the high precision location of each of the videos. When refreshing
   * time dependent items in the UI we pull from the first record here,
   * likewise when setting bookmark times, we also use this value.
   */
  const handleVideoTimeChanged = useCallback((video: Video, time: number) => {
    videoTimes.current[video.id] = time;
  }, []);

  /**
   * Used to drive UI elements that need to show the current time (i.e progress
   * bar, progress timer). This is a low resolution representation of the
   * current time and should only be used for UI elements.
   */
  useEffect(() => {
    const timer = setInterval(updateCurrentTime, UI_REFRESH_RATE);

    return () => {
      updateCurrentTime();
      clearInterval(timer);
    };
  }, [updateCurrentTime]);

  /**
   * Stop the video playing when the component is unmounted. Triggered when
   * going between main navigation items.
   */
  useEffect(() => {
    return () => {
      stopPlaying();
    };
  }, [stopPlaying]);

  /**
   * Watch the current videos bookmarks and populate which have changed.
   */
  useEffect(() => {
    if (!activeVideo) {
      return;
    }

    // mark all bookmarks before current time as seen
    const newSeenBoomarks = activeVideo.bookmarks.reduce(
      (acc: SeenBookmarks, bookmark) => {
        /**
         * We need to check if we're within a certain margin of error when
         * checking if the bookmark is active. This can occur when we
         * navigate or run into a bookmark and the "real" video time does
         * not line up with the currentTime.
         * */
        const withinFudgeWindow =
          seenBookmarks[bookmark.id] === true &&
          bookmark.time - currentTime < 0.05;

        acc[bookmark.id] = bookmark.time <= currentTime || withinFudgeWindow;
        return acc;
      },
      {}
    );

    if (isEqual(newSeenBoomarks, seenBookmarks) === false) {
      setSeenBookmarks(newSeenBoomarks);
    }
  }, [seenBookmarks, currentTime, activeVideo, setSeenBookmarks]);

  /**
   * Watch the current time and find bookmarks that haven't been seen, if we
   * encounter one, pause the video.
   */
  useEffect(() => {
    if (!activeVideo || !currentTime || playing === false || seeking === true) {
      return;
    }

    // find any bookmarks in the past that might not have been seen
    const unseenPastBookmark = activeVideo.bookmarks.find((bookmark) => {
      return (
        bookmark.time <= currentTime && seenBookmarks[bookmark.id] === false
      );
    });

    if (unseenPastBookmark !== undefined) {
      const { time } = unseenPastBookmark;

      stopPlaying();
      setCurrentTime(time);
      // bus.emit(GLOBAL_TIME_CHANGE, { time }); // enable this to go to the exact bookmark frame
      setSeenBookmarks({
        ...seenBookmarks,
        [unseenPastBookmark.id]: true,
      });
    }
  }, [
    activeVideo,
    bus,
    currentTime,
    playing,
    seeking,
    seenBookmarks,
    setCurrentTime,
    setSeenBookmarks,
    stopPlaying,
  ]);

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

  /**
   * When changing between active videos, show the controls for some time
   */
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
   * When toggling the override hide off, set the mouse being active to toggle
   * on the controls.
   */
  useEffect(() => {
    if (overrideHideControls === false) {
      setMouseLastActive(Date.now());
    }
  }, [overrideHideControls, setMouseLastActive]);

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
    return (
      <VideoThumbnail
        key={video.id}
        video={video}
        onVideoTimeChanged={handleVideoTimeChanged}
      />
    );
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
      (showControls === true || playerHeaderOn === true) && (
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
          <Flex
            background="gray.900"
            borderColor="whiteAlpha.500"
            borderTop="none"
            borderWidth="1px"
            onMouseEnter={() => setControlsOn(true)}
            onMouseLeave={() => setControlsOn(false)}
            p={4}
            pointerEvents="all"
            alignItems="center"
          >
            <Box mr="4" fontSize="xl">
              <Kbd>{activeVideoIndex + 1}</Kbd>
            </Box>
            <Heading fontSize="xl">{activeVideo.name}</Heading>
          </Flex>
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

    const renderedActiveBookmark = activeBookmark !== undefined &&
      showControls === true && (
        <VideoBookmarkShow
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
                key={activeVideo.id}
                app={app}
                disabled={!!activeBookmark || editingBookmark || isAfterRange}
                scale={scale}
                video={activeVideo}
                videoTimes={videoTimes.current}
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
          {renderedHeader}
          {renderedDrawingControls}
          {renderedNavigationControls}
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
