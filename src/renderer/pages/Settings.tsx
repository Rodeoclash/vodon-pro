import {
  Box,
  FormControl,
  FormLabel,
  Heading,
  Radio,
  RadioGroup,
  FormHelperText,
  Stack,
  Switch,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';

import useSettingsStore, {
  ArrowKeyNavigationMode,
} from '../services/stores/settings';

import NoSidebar from '../layouts/NoSidebar';

export default function Settings() {
  const toggleSlowCPUMode = useSettingsStore(
    (state) => state.toggleSlowCPUMode
  );

  const setArrowKeyNavigationMode = useSettingsStore(
    (state) => state.setArrowKeyNavigationMode
  );

  const setArrowKeyJumpDistance = useSettingsStore(
    (state) => state.setArrowKeyJumpDistance
  );

  const toggleClearDrawingsOnPlay = useSettingsStore(
    (state) => state.toggleClearDrawingsOnPlay
  );

  const arrowKeyNavigationMode = useSettingsStore(
    (state) => state.arrowKeyNavigationMode
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

  const arrowKeyNavigationModes = Object.entries(
    ArrowKeyNavigationMode
  ) as Array<[string, string]>;

  const renderedArrowKeyNavigationModes = arrowKeyNavigationModes.map(
    ([key, value]) => {
      return (
        <Radio value={value} mr={4} key={key}>
          {value}
        </Radio>
      );
    }
  );

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
          <Heading as="h1" fontSize="1xl" mb={4}>
            Default arrow key behaviour
          </Heading>
          <RadioGroup
            value={arrowKeyNavigationMode}
            onChange={(mode: ArrowKeyNavigationMode) =>
              setArrowKeyNavigationMode(mode)
            }
          >
            <Stack direction="row">{renderedArrowKeyNavigationModes}</Stack>
          </RadioGroup>
          <FormHelperText>
            <Text mb={2}>
              Changes the behaviour of the arrow keys when reviewing videos.
            </Text>
            <Text mb={2}>
              <strong>Frame adjust</strong> will make pressing the arrow keys
              navigate one frame at a time
            </Text>
            <Text mb={2}>
              <strong>Jump time</strong> will make pressing the arrow keys
              navigate forwards and back by a set amount of time.
            </Text>
          </FormHelperText>
        </FormControl>

        <FormControl my={4} width="container.sm">
          <FormLabel htmlFor="arrow-key-jump-distance" mb="4">
            Arrow key jump distance
          </FormLabel>
          <NumberInput
            id="arrow-key-jump-distance"
            max={60}
            min={1}
            onChange={(str) => handleArrowKeyJumpDistanceChange(str)}
            precision={2}
            step={1}
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
            When using the arrow keys to jump forward and back, how far will it
            travel (in seconds)
          </FormHelperText>
        </FormControl>
      </Box>
    </NoSidebar>
  );
}
