import { Text } from '@chakra-ui/react';
import useStore from '../../services/stores/videos';

import { secondsToHms } from '../../services/time';

export default function GlobalTimeDisplay() {
  const currentTime = useStore((state) => state.currentTime);
  const fullDuration = useStore((state) => state.fullDuration);

  if (fullDuration === null) {
    return null;
  }

  return (
    <Text whiteSpace="nowrap" fontSize="sm" align="center">
      {secondsToHms(Math.round(currentTime))} /{' '}
      {secondsToHms(Math.round(fullDuration))}
    </Text>
  );
}
