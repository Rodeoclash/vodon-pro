import useStore from '../../services/store';

import {
  Flex,
  SliderTrack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react';

import { Volume as VolumeIcon } from 'tabler-icons-react';

import type { Video } from '../../services/models/Video';

type PropsType = {
  video: Video;
};

export default function VideoVolume({ video }: PropsType) {
  const setVideoVolume = useStore((state) => state.setVideoVolume);

  function handleSliderChange(value: number) {
    setVideoVolume(video, value);
  }

  return (
    <Flex align={'center'} width={'7rem'}>
      <VolumeIcon />
      <Slider
        key="playing"
        aria-label="Video volume control"
        value={video.volume}
        min={0}
        max={1}
        onChange={handleSliderChange}
        step={0.01}
        focusThumbOnChange={false}
        ml={2}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </Flex>
  );
}
