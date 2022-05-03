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

  const arrowKeyNavigationMode = useSettingsStore(
    (state) => state.arrowKeyNavigationMode
  );

  const arrowKeyJumpDistance = useSettingsStore(
    (state) => state.arrowKeyJumpDistance
  );

  const slowCPUMode = useSettingsStore((state) => state.slowCPUMode);

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
      <Box p="8" width="container.sm">
        <Heading as="h1" fontSize="4xl">
          Settings
        </Heading>

        <Heading as="h1" fontSize="2xl" mt="8" mb="4">
          General
        </Heading>

        <FormControl my={4}>
          <FormLabel htmlFor="slow-cpu-setting" mb="4">
            Slow CPU mode
          </FormLabel>
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

        <Heading as="h1" fontSize="2xl" mt="8" mb="4">
          Video navigation
        </Heading>

        <FormControl my={4}>
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
              navigate one frame at a time (holding shift will jump time)
            </Text>
            <Text mb={2}>
              <strong>Jump time</strong> will make pressing the arrow keys
              navigate forwards and back by a set amount of time (holding shift
              will navigate by frames)
            </Text>
          </FormHelperText>
        </FormControl>

        <FormControl my={4}>
          <FormLabel htmlFor="arrow-key-jump-distance" mb="4">
            Arrow key jump distance
          </FormLabel>
          <NumberInput
            value={arrowKeyJumpDistance}
            min={1}
            max={60}
            id="arrow-key-jump-distance"
            width="20"
            onChange={(_str, num) => setArrowKeyJumpDistance(num)}
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
