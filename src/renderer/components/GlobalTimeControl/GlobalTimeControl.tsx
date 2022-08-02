import { useRef, useState, useLayoutEffect } from 'react';
import { useBus } from 'react-bus';
import {
  Box,
  Flex,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from '@chakra-ui/react';
import { GLOBAL_TIME_CHANGE } from '../../services/bus';

import useStore from '../../services/stores/videos';

import VideoBookmarkTimeline from '../VideoBookmarkTimeline/VideoBookmarkTimeline';

import type { Video } from '../../services/models/Video';

type Props = {
  video: Video;
};

export default function GlobalTimeControl({ video }: Props) {
  const bus = useBus();

  const trackRef = useRef<HTMLDivElement | null>(null);

  const stopPlaying = useStore((state) => state.stopPlaying);
  const setCurrentTime = useStore((state) => state.setCurrentTime);
  const videos = useStore((state) => state.videos);

  const currentTime = useStore((state) => state.currentTime);
  const fullDuration = useStore((state) => state.fullDuration);

  const [trackDimensions, setTrackDimensions] = useState<DOMRect | null>(null); // tracks the dimensions of the track as it's resized

  function handleSliderChange(time: number) {
    stopPlaying();
    bus.emit(GLOBAL_TIME_CHANGE, { time });
    setCurrentTime(time); // REMOVE ONCE GLOBAL TIME CALCULATED FROM CURRENT VIDEO
  }

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

      <Slider
        aria-label="Global time control"
        focusThumbOnChange={false}
        key="playing"
        max={fullDuration}
        min={0}
        onChange={(value: number) => handleSliderChange(value)}
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
