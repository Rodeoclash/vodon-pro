import { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { css } from '@emotion/react';

import useStore from '../services/stores/videos';
import { getRatioDimensions } from '../services/layout';

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

import Drawing from '../components/Drawing/Drawing';
import DrawingControls from '../components/DrawingControls/DrawingControls';
import GlobalTimeControl from '../components/GlobalTimeControl/GlobalTimeControl';
import GlobalTimeDisplay from '../components/GlobalTimeDisplay/GlobalTimeDisplay';
import Hotkeys from './ReviewVideos/Hotkeys';
import PlaybackSpeed from '../components/PlaybackSpeed/PlaybackSpeed';
import VideoBookmark from '../components/VideoBookmark/VideoBookmark';
import VideoBookmarkAdd from '../components/VideoBookmarkAdd/VideoBookmarkAdd';
import VideoStepControl from '../components/VideoStepControl/VideoStepControl';
import VideoThumbnail from '../components/VideoThumbnail/VideoThumbnail';
import VideoVolume from '../components/VideoVolume/VideoVolume';
import WithSidebar from '../layouts/WithSidebar';

export default function ReviewVideos() {
  const overlayRef = useRef(null);
  const videoRef = useRef(null);

  const [startedPlayingAt, setStartedPlayingAt] = useState(null);
  const [videoDimensions, setVideoDimensions] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [app, setApp] = useState<TldrawApp>();

  const startPlaying = useStore((state) => state.startPlaying);
  const stopPlaying = useStore((state) => state.stopPlaying);
  const setCurrentTime = useStore((state) => state.setCurrentTime);

  const activeVideoId = useStore((state) => state.activeVideoId);
  const currentTime = useStore((state) => state.currentTime);
  const editingBookmark = useStore((state) => state.editingBookmark);
  const playbackSpeed = useStore((state) => state.playbackSpeed);
  const playing = useStore((state) => state.playing);
  const videos = useStore((state) => state.videos);

  const activeVideo = videos.find((video) => {
    return activeVideoId === video.id;
  });

  const activeBookmark = !activeVideo
    ? null
    : activeVideo.bookmarks.find((bookmark) => {
        return bookmark.time === currentTime;
      });

  const isAfterRange =
    activeVideo && currentTime >= activeVideo.durationNormalised;

  function handleEscapePressed() {
    setFullscreen(false);
  }

  function handleClickStep(distance: number) {
    setCurrentTime(useStore.getState().currentTime + distance); // HACK HACK - why does it have to read directly from the state here??
  }

  async function handleClickFullscreen() {
    setFullscreen(!fullscreen);
  }

  function handleTLDrawAppMount(app: TldrawApp) {
    setApp(app);
  }

  /**
   * Stop the video playing when leaving
   */
  useEffect(() => {
    return () => {
      stopPlaying();
    };
  }, []);

  /**
   * Handles mounting the videos into the main playing area.
   */
  useEffect(() => {
    if (activeVideo === undefined || videoRef.current === null) {
      return;
    }

    videoRef.current.innerHTML = '';
    videoRef.current.appendChild(activeVideo.el);

    activeVideo.el.volume = activeVideo.volume;
  }, [activeVideo]);

  // when we start playing, store the time that play started
  useEffect(() => {
    if (playing === false) {
      return setStartedPlayingAt(null);
    }

    setStartedPlayingAt(Date.now());
  }, [playing]);

  // when we have a time we started playing at, start a click to update the current time
  useEffect(() => {
    if (startedPlayingAt === null) {
      return;
    }

    function updateCurrentTime() {
      setCurrentTime(
        currentTime + ((Date.now() - startedPlayingAt) / 1000 - 0.06) * playbackSpeed
      ); // HACK HACK - We should use something where we have control over the clock driving the video (i.e. gstreamer)
    }

    const timer = setInterval(updateCurrentTime, 500);

    return () => {
      updateCurrentTime();
      clearInterval(timer);
    };
  }, [startedPlayingAt]);

  // watch for fullscreen being set and trigger
  useEffect(() => {
    if (fullscreen === null) {
      return;
    }

    if (fullscreen === true) {
      (async () => {
        await activeVideo.el.requestFullscreen();
        window.dispatchEvent(new Event('resize'));
      })();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();

      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
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
   * The scale of how much the current video has been reduced in size. If no
   * video has been loaded, we default to 1. If a video has been loaded,
   * determine how much smaller it is compared to its native resolution. This
   * only takes into account width scaling.
   */
  const scale =
    !videoDimensions || !activeVideo
      ? 1
      : videoDimensions[0] / activeVideo.codedWidth;

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

  const renderedSidebarVideos = videos.map((video) => {
    return <VideoThumbnail key={video.id} video={video} />;
  });

  const renderedSidebar = (
    <Flex
      direction={'column'}
      height={'calc(100vh - 5rem)'}
      justifyContent={'space-evenly'}
    >
      {renderedSidebarVideos}
    </Flex>
  );

  const renderedContent = (() => {
    if (videos.length === 0) {
      return (
        <Flex
          flexGrow={1}
          align={'center'}
          justifyContent={'center'}
          fontSize={'3xl'}
          color={'whiteAlpha.400'}
        >
          <Link to="/">
            <Text>Please setup some videos first</Text>
          </Link>
        </Flex>
      );
    }

    if (activeVideo === undefined) {
      return (
        <Flex
          flexGrow={1}
          align={'center'}
          justifyContent={'center'}
          fontSize={'3xl'}
          color={'whiteAlpha.400'}
        >
          <Link to="/">
            <Text>Please choose a video</Text>
          </Link>
        </Flex>
      );
    }

    return (
      <>
        {videoDimensions && (
          <Box borderBottom={'1px'} borderColor={'whiteAlpha.300'}>
            <Flex
              mx={'auto'}
              alignItems={'center'}
              justifyContent={'center'}
              height={'4rem'}
              px={8}
              boxSizing={'border-box'}
            >
              <Box>
                <Heading fontSize={'2xl'}>{activeVideo.name}</Heading>
              </Box>
            </Flex>
          </Box>
        )}
        <Flex flexGrow={1} flexShrink={1} overflow={'hidden'}>
          <Box
            borderRight={'1px'}
            borderColor={'whiteAlpha.300'}
            boxSizing={'border-box'}
            padding={4}
          >
            {app && <DrawingControls app={app} />}
          </Box>
          <Flex
            align={'center'}
            flexGrow={1}
            flexShrink={1}
            justifyContent={'center'}
            ref={overlayRef}
            overflow={'hidden'}
          >
            <Box position={'relative'} css={overlayStyle}>
              <Drawing
                onMount={handleTLDrawAppMount}
                scale={scale}
                video={activeVideo}
                videoBookmark={activeBookmark}
              />
              {activeVideoId !== null && (
                <VideoBookmark
                  video={activeVideo}
                  bookmark={activeBookmark}
                  scale={scale}
                />
              )}
              {isAfterRange && (
                <Flex
                  position={'absolute'}
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  backgroundColor={'gray.800'}
                  align={'center'}
                  justifyContent={'center'}
                >
                  Finished{' '}
                  {Math.round(
                    Math.abs(activeVideo.durationNormalised - currentTime)
                  )}
                  s ago
                </Flex>
              )}
              <Box css={videoStyle} ref={videoRef} />
            </Box>
          </Flex>
        </Flex>
        <Flex
          flexGrow={0}
          align="center"
          p={'4'}
          boxSizing={'border-box'}
          borderTop={'1px'}
          borderColor={'whiteAlpha.300'}
        >
          <Tooltip label={playing ? 'Pause' : 'Play'}>
            <Box mr={'2'}>
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

          <Box mx={'2'}>
            <VideoStepControl
              direction="backwards"
              frameRate={activeVideo.frameRate}
              onClick={handleClickStep}
            />
          </Box>

          <Box mx={'2'}>
            <GlobalTimeDisplay />
          </Box>

          <Box flexGrow={1} mx={'2'}>
            <GlobalTimeControl video={activeVideo} />
          </Box>

          <Box mx={'2'}>
            <VideoVolume video={activeVideo} />
          </Box>

          <Box mx={'2'}>
            <VideoStepControl
              direction="forwards"
              frameRate={activeVideo.frameRate}
              onClick={handleClickStep}
            />
          </Box>

          <Box mx={'2'}>
            <VideoBookmarkAdd
              app={app}
              disabled={!!activeBookmark || editingBookmark || isAfterRange}
              scale={scale}
              video={activeVideo}
            />
          </Box>

          <Tooltip label="Go fullscreen">
            <Box ml={'2'}>
              <IconButton
                onClick={handleClickFullscreen}
                icon={<MaximizeIcon />}
                aria-label="Fullscreen video"
                disabled={isAfterRange}
              />
            </Box>
          </Tooltip>
        </Flex>
      </>
    );
  })();

  return (
    <>
      {activeVideo !== undefined && (
        <Hotkeys onEscape={handleEscapePressed} video={activeVideo} />
      )}
      <WithSidebar sidebar={renderedSidebar} disableSidebar={videos.length < 2}>
        <Flex
          direction="column"
          width="100%"
          height={'calc(100vh - 5rem)'}
        >
          {renderedContent}
        </Flex>
      </WithSidebar>
    </>
  );
}
