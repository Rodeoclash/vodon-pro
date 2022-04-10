import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { createPopper, VirtualElement } from "@popperjs/core";

import useStore from "../../services/store";

import {
  Box,
  Flex,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from "@chakra-ui/react";

import VideoBookmark from "../VideoBookmark/VideoBookmark";

import type { Video } from "../../services/models/Video";

type Props = {
  video: Video;
};

export default function GlobalTimeControl({ video }: Props) {
  const trackRef = useRef(null);
  const popupRef = useRef(null);
  const imageRef = useRef(null);

  const stopPlaying = useStore((state) => state.stopPlaying);
  const setCurrentTime = useStore((state) => state.setCurrentTime);

  const currentTime = useStore((state) => state.currentTime);
  const maxDuration = useStore((state) => state.maxDuration);

  const [second, setSecond] = useState(null); // the currently moused over "second" position
  const [imageSrc, setImageSrc] = useState(null); // current "preview" image, based on mouseover second
  const [mouseOver, setMouseOver] = useState(false); // track the mouse being over the track
  const [trackDimensions, setTrackDimensions] = useState(null); // tracks the dimensions of the track as it's resized

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
    const trackBounding = trackRef.current.getBoundingClientRect();
    const percentage =
      (event.clientX - trackBounding.left) / trackBounding.width;
    setSecond(String(Math.round(maxDuration * percentage)).padStart(4, "0"));
  }

  useLayoutEffect(() => {
    function handleResize() {
      if (trackRef.current === null) {
        return;
      }

      setTrackDimensions(trackRef.current.getBoundingClientRect());
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /**
   * As the preview second changes, attempt to load the thumbnails of the
   * images. Only do so if we have a location and the image can actually
   * be found (users might have loaded a pre-thumbnails project or
   * thumbnails are still generating)
   */
  useEffect(() => {
    if (second === null || video.thumbnailGenerationLocation === null) {
      return;
    }

    const src = `${video.thumbnailGenerationLocation}\\${second}.jpg`;
    const img = new Image();

    img.src = src;

    img.onload = () => {
      setImageSrc(src);
    };

    img.onerror = () => {
      setImageSrc(null);
    };
  }, [second]);

  /**
   * Place the preview box tethered to the mouse and the track
   */
  useLayoutEffect(() => {
    if (mouseOver === false) {
      return;
    }

    function generateGetBoundingClientRect(x = 0, y = 0) {
      const trackBounding = trackRef.current.getBoundingClientRect();

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
          name: "offset",
          options: {
            offset: [0, 20],
          },
        },
      ],
    });

    function handleMouseMove(event: MouseEvent) {
      virtualElement.getBoundingClientRect = generateGetBoundingClientRect(
        event.clientX,
        event.clientY
      );

      instance.update();
    }

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      instance.destroy();
    };
  }, [mouseOver]);

  const renderedBookmarks =
    trackDimensions === null
      ? []
      : video.bookmarks.map((bookmark) => {
          const percentage = bookmark.time / maxDuration;
          const left = trackDimensions.width * percentage;

          return (
            <Flex
              key={bookmark.id}
              bgColor={"gray.800"}
              position={"absolute"}
              width={"2rem"}
              height={"2rem"}
              align={"center"}
              justify={"center"}
              top={"-7px"}
              left={`calc(${left}px - 1rem)`}
              rounded={"full"}
              zIndex={"1"}
            >
              <VideoBookmark video={video} bookmark={bookmark} />
            </Flex>
          );
        });

  return (
    <Box position="relative">
      {renderedBookmarks}
      <Box
        ref={popupRef}
        position="absolute"
        display={mouseOver === true ? "block" : "none"}
        zIndex={"2"}
      >
        <img width="400px" ref={imageRef} src={imageSrc} />
      </Box>
      <Slider
        aria-label="Global time control"
        focusThumbOnChange={false}
        key="playing"
        max={maxDuration}
        min={0}
        onChange={handleSliderChange}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMoveSliderTrack}
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
