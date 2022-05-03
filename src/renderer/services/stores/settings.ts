import createStore from 'zustand';
import { persist } from 'zustand/middleware';

const PERSIST_VERSION = 0;

interface StateData {
  showSetupInstructions: boolean;
  slowCPUMode: boolean;
}

interface State extends StateData {
  setShowSetupInstructions: (value: boolean) => void;
  toggleSlowCPUMode: () => void;
}

const emptyState: StateData = {
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
      toggleSlowCPUMode: () =>
        set((state) => ({ slowCPUMode: !state.slowCPUMode })),

      setShowSetupInstructions: (value) =>
        set(() => ({ showSetupInstructions: value })),

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
