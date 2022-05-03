import createStore from 'zustand';
import { persist } from 'zustand/middleware';

const PERSIST_VERSION = 0;

export enum ArrowKeyNavigationMode {
  'frame' = 'Frame adjust',
  'seek' = 'Jump time',
}

interface StateData {
  arrowKeyJumpDistance: number;
  arrowKeyNavigationMode: ArrowKeyNavigationMode;
  showSetupInstructions: boolean;
  slowCPUMode: boolean;
}

interface State extends StateData {
  setArrowKeyJumpDistance: (seconds: number) => void;
  setArrowKeyNavigationMode: (value: ArrowKeyNavigationMode) => void;
  setShowSetupInstructions: (value: boolean) => void;
  toggleSlowCPUMode: () => void;
}

const emptyState: StateData = {
  arrowKeyJumpDistance: 10,
  arrowKeyNavigationMode: ArrowKeyNavigationMode.frame,
  showSetupInstructions: true,
  slowCPUMode: false,
};

const serialize = (state: object) => {
  return JSON.stringify(state);
};

const deserialize = (str: string) => {
  return JSON.parse(str);
};

const useStore = createStore<State>(
  persist(
    (set) => ({
      setArrowKeyJumpDistance: (seconds) =>
        set(() => ({ arrowKeyJumpDistance: seconds })),
      setArrowKeyNavigationMode: (mode) =>
        set(() => ({ arrowKeyNavigationMode: mode })),
      setShowSetupInstructions: (value) =>
        set(() => ({ showSetupInstructions: value })),
      toggleSlowCPUMode: () =>
        set((state) => ({ slowCPUMode: !state.slowCPUMode })),

      ...emptyState,
    }),
    {
      name: 'vodon-store-settings-v1',
      version: PERSIST_VERSION,
      serialize,
      deserialize,
    }
  )
);

export default useStore;
