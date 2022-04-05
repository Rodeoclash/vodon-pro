import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { createPopper, VirtualElement } from "@popperjs/core";

import useStore from "../../services/store";

import { Box, SliderTrack, Slider, SliderFilledTrack, SliderThumb } from "@chakra-ui/react";

import type { Video } from "../../services/models/Video";

type Props = {
  video: Video;
};

export default function CurrentTimeSliderControl({ video }: Props) {
  const trackRef = useRef(null);
  const popupRef = useRef(null);
  const imageRef = useRef(null);

  const stopPlaying = useStore((state) => state.stopPlaying);
  const setCurrentTime = useStore((state) => state.setCurrentTime);

  const currentTime = useStore((state) => state.currentTime);
  const maxDuration = useStore((state) => state.maxDuration);

  const [second, setSecond] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [mouseOver, setMouseOver] = useState(false);

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
    const percentage = (event.clientX - trackBounding.left) / trackBounding.width;
    setSecond(String(Math.round(maxDuration * percentage)).padStart(4, "0"));
  }

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
      virtualElement.getBoundingClientRect = generateGetBoundingClientRect(event.clientX, event.clientY);
      instance.update();
    }

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      instance.destroy();
    };
  }, [mouseOver]);

  return (
    <>
      <Box ref={popupRef} position="absolute" display={mouseOver === true ? "block" : "none"}>
        <img width="400px" ref={imageRef} src={imageSrc} />
      </Box>
      <Slider
        onMouseMove={handleMouseMoveSliderTrack}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        key="playing"
        aria-label="Global time control"
        value={currentTime}
        min={0}
        max={maxDuration}
        onChange={handleSliderChange}
        step={1 / video.frameRate}
        focusThumbOnChange={false}
      >
        <SliderTrack ref={trackRef}>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </>
  );
}
