import { Select } from '@chakra-ui/react';
import useStore from '../../services/stores/videos';

const availableSpeeds = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2];

type Props = {
  disabled: boolean;
};

export default function PlaybackSpeed({ disabled }: Props) {
  const setPlaybackSpeed = useStore((state) => state.setPlaybackSpeed);
  const playbackSpeed = useStore((state) => state.playbackSpeed);

  const renderedOptions = availableSpeeds.map((speed) => {
    return (
      <option key={speed} value={speed}>
        {speed}x
      </option>
    );
  });

  return (
    <Select
      onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
        setPlaybackSpeed(parseFloat(event.target.value));
      }}
      disabled={disabled}
      value={playbackSpeed}
    >
      {renderedOptions}
    </Select>
  );
}
