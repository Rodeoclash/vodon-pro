import {
  Heading,
  Box,
  FormControl,
  FormLabel,
  Switch,
  Text,
} from '@chakra-ui/react';

import useSettingsStore from '../services/stores/settings';

import NoSidebar from '../layouts/NoSidebar';

export default function Settings() {
  const slowCPUMode = useSettingsStore((state) => state.slowCPUMode);
  const toggleSlowCPUMode = useSettingsStore(
    (state) => state.toggleSlowCPUMode
  );

  return (
    <NoSidebar>
      <Box p="8">
        <Heading as="h1" fontSize="large" mb="4">
          Settings
        </Heading>
        <Box>
          <FormControl display="flex" alignItems="center" mb="2">
            <FormLabel htmlFor="slow-cpu-setting" mb="0">
              Slow CPU mode
            </FormLabel>
            <Switch
              id="slow-cpu-setting"
              isChecked={slowCPUMode}
              onChange={toggleSlowCPUMode}
            />
          </FormControl>
          <Text fontSize="sm" width="container.sm">
            If you are experiencing choppy playback, enabling this option to
            reduce CPU load by disabling smooth playback of thumbnail videos.
          </Text>
        </Box>
      </Box>
    </NoSidebar>
  );
}
