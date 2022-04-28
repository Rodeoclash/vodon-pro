import { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { createPopper } from '@popperjs/core';
import { debounce } from 'lodash';

import {
  Box,
  Flex,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from '@chakra-ui/react';
import useStore from '../../services/store';

import VideoBookmarkTimeline from '../VideoBookmarkTimeline/VideoBookmarkTimeline';

import type { Video } from '../../services/models/Video';

type Props = {
  video: Video;
};

export default function GlobalTimeControl({ video }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const stopPlaying = useStore((state) => state.stopPlaying);
  const setCurrentTime = useStore((state) => state.setCurrentTime);
  const videos = useStore((state) => state.videos);

  const currentTime = useStore((state) => state.currentTime);
  const fullDuration = useStore((state) => state.fullDuration);

  const [second, setSecond] = useState<number | null>(null); // the currently moused over "second" position
  const [imageSrc, setImageSrc] = useState<string | null>(null); // current "preview" image, based on mouseover second
  const [mouseOver, setMouseOver] = useState<boolean>(false); // track the mouse being over the track
  const [trackDimensions, setTrackDimensions] = useState<any | null>(null); // tracks the dimensions of the track as it's resized

  function handleSliderChange(newTime: number) {
    stopPlaying();
    setCurrentTime(newTime);
  }

  function handleMouseEnter() {
    setMouseOver(true);
  }

  function handleMouseLeave() {
    setMouseOver(false);
  }

  function handleMouseMoveSliderTrack(event: React.MouseEvent<HTMLDivElement>) {
    if (trackRef.current === null || fullDuration == null) {
      return;
    }

    const trackBounding = trackRef.current.getBoundingClientRect();
    const percentage =
      (event.clientX - trackBounding.left) / trackBounding.width;
    setSecond(fullDuration * percentage);
  }

  const handleMouseMoveSliderTrackDebounced = debounce(
    handleMouseMoveSliderTrack,
    500
  );

  useLayoutEffect(() => {
    function handleResize() {
      if (trackRef.current === null) {
        return;
      }

      setTrackDimensions(trackRef.current.getBoundingClientRect());
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  /**
   * As the preview second changes, attempt to load the thumbnails of the
   * images. Only do so if we have a location and the image can actually
   * be found (users might have loaded a pre-thumbnails project or
   * thumbnails are still generating)
   */
  useEffect(() => {
    if (second === null) {
      return;
    }

    window.video
      .screenshot(video.filePath, second)
      .then((src) => {
        return setImageSrc(src);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Unable to generate image from video', error);
      });
  }, [video, second]);

  /**
   * Place the preview box tethered to the mouse and the track
   */
  useLayoutEffect(() => {
    if (mouseOver === false || popupRef.current === null) {
      return undefined;
    }

    function generateGetBoundingClientRect(x = 0) {
      const trackBounding =
        trackRef.current === null
          ? { top: 0 }
          : trackRef.current.getBoundingClientRect();

      return () => ({
        width: 0,
        height: 0,
        top: trackBounding.top,
        right: x,
        bottom: trackBounding.top,
        left: x,
      });
    }

    const virtualElement: any = {
      getBoundingClientRect: generateGetBoundingClientRect(),
    };

    const instance = createPopper(virtualElement, popupRef.current, {
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 20],
          },
        },
      ],
    });

    function handleMouseMove(event: MouseEvent) {
      virtualElement.getBoundingClientRect = generateGetBoundingClientRect(
        event.clientX
      );

      instance.update();
    }

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      instance.destroy();
    };
  }, [mouseOver]);

  if (fullDuration === null) {
    return null;
  }

  const renderedCurrentBookmarks =
    trackDimensions === null
      ? []
      : video.bookmarks.map((bookmark) => {
          const percentage = bookmark.time / fullDuration;
          const left = trackDimensions.width * percentage;

          return (
            <Flex
              key={bookmark.id}
              bgColor="gray.800"
              position="absolute"
              width="2rem"
              height="2rem"
              align="center"
              justify="center"
              top="-7px"
              left={`calc(${left}px - 1rem)`}
              rounded="full"
              zIndex="1"
            >
              <VideoBookmarkTimeline
                video={video}
                bookmark={bookmark}
                size="medium"
              />
            </Flex>
          );
        });

  const renderedOtherBookmarks =
    trackDimensions === null
      ? []
      : videos
          .filter((innerVideo) => {
            return innerVideo.id !== video.id;
          })
          .flatMap((innerVideo) => {
            return innerVideo.bookmarks.map((bookmark) => {
              const percentage = bookmark.time / fullDuration;
              const left = trackDimensions.width * percentage;

              return (
                <Flex
                  key={bookmark.id}
                  bgColor="gray.900"
                  position="absolute"
                  width="1.5rem"
                  height="1.5rem"
                  align="center"
                  justify="center"
                  top="-2px"
                  left={`calc(${left}px - .75rem)`}
                  rounded="full"
                  zIndex="1"
                >
                  <VideoBookmarkTimeline
                    video={innerVideo}
                    bookmark={bookmark}
                    size="small"
                  />
                </Flex>
              );
            });
          });

  return (
    <Box position="relative">
      {renderedCurrentBookmarks}
      {renderedOtherBookmarks}

      <Box
        ref={popupRef}
        position="absolute"
        display={mouseOver === true ? 'block' : 'none'}
        zIndex="2"
      >
        <img
          width="400px"
          ref={imageRef}
          src={imageSrc || ''}
          alt="Frame preview"
        />
      </Box>

      <Slider
        aria-label="Global time control"
        focusThumbOnChange={false}
        key="playing"
        max={fullDuration}
        min={0}
        onChange={(value) => handleSliderChange(value)}
        onMouseEnter={() => handleMouseEnter()}
        onMouseLeave={() => handleMouseLeave()}
        onMouseMove={(event) => handleMouseMoveSliderTrackDebounced(event)}
        step={1 / video.frameRate}
        value={currentTime}
      >
        <SliderTrack ref={trackRef}>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </Box>
  );
}
