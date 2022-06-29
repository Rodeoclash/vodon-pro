import {
  Box,
  FormControl,
  FormLabel,
  Heading,
  FormHelperText,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';

import useSettingsStore from '../services/stores/settings';

import NoSidebar from '../layouts/NoSidebar';

export default function Settings() {
  const toggleSlowCPUMode = useSettingsStore(
    (state) => state.toggleSlowCPUMode
  );

  const setArrowKeyJumpDistance = useSettingsStore(
    (state) => state.setArrowKeyJumpDistance
  );

  const toggleClearDrawingsOnPlay = useSettingsStore(
    (state) => state.toggleClearDrawingsOnPlay
  );

  const arrowKeyJumpDistance = useSettingsStore(
    (state) => state.arrowKeyJumpDistance
  );

  const clearDrawingsOnPlay = useSettingsStore(
    (state) => state.clearDrawingsOnPlay
  );

  const slowCPUMode = useSettingsStore((state) => state.slowCPUMode);

  function handleArrowKeyJumpDistanceChange(value: string) {
    if (value) {
      setArrowKeyJumpDistance(value);
    }
  }

  return (
    <NoSidebar>
      <Box p="8" overflow="auto" height="100%" width="100%">
        <Heading as="h1" fontSize="5xl">
          Settings
        </Heading>

        <Heading as="h1" fontSize="3xl" mt="8" mb="4">
          General
        </Heading>

        <FormControl my={4} width="container.sm">
          <FormLabel htmlFor="slow-cpu-setting">Slow CPU mode</FormLabel>
          <Switch
            id="slow-cpu-setting"
            isChecked={slowCPUMode}
            onChange={toggleSlowCPUMode}
          />
          <FormHelperText>
            If you are experiencing choppy playback, enabling this option to
            reduce CPU load by disabling smooth playback of thumbnail videos.
          </FormHelperText>
        </FormControl>

        <FormControl my={4} width="container.sm">
          <FormLabel htmlFor="clear-drawings-on-play">
            Clear drawings when playing
          </FormLabel>
          <Switch
            id="clear-drawings-on-play"
            isChecked={clearDrawingsOnPlay}
            onChange={toggleClearDrawingsOnPlay}
          />
          <FormHelperText>
            When set, playing a video or navigating by frame will cause the
            drawing to be cleared off the screen.
          </FormHelperText>
        </FormControl>

        <Heading as="h1" fontSize="3xl" mt="8" mb="4">
          Video navigation
        </Heading>

        <FormControl my={4} width="container.sm">
          <FormLabel htmlFor="arrow-key-jump-distance" mb="4">
            Arrow key jump distance
          </FormLabel>
          <NumberInput
            id="arrow-key-jump-distance"
            max={60}
            min={0.1}
            onChange={(str: string) => handleArrowKeyJumpDistanceChange(str)}
            precision={2}
            step={0.1}
            value={arrowKeyJumpDistance}
            width={32}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormHelperText>
            When using the up down (or a and d) arrow keys to jump forward and
            back, how far will it travel (in seconds)
          </FormHelperText>
        </FormControl>
      </Box>
    </NoSidebar>
  );
}
