import createStore from 'zustand';
import { persist } from 'zustand/middleware';

const CURRENT_PERSIST_VERSION = 0;
const DEFAULT_SIDEBAR_WIDTH = 450;

interface StateData {
  arrowKeyJumpDistance: string;
  clearDrawingsOnPlay: boolean;
  shownFirstHelpReview: boolean;
  shownFirstHelpSetup: boolean;
  showSetupInstructions: boolean;
  sidebarWidth: number;
  slowCPUMode: boolean;
  zoomPanEnabled: boolean;
}

interface State extends StateData {
  setArrowKeyJumpDistance: (seconds: string) => void;
  setShownFirstHelpReview: (value: boolean) => void;
  setShownFirstHelpSetup: (value: boolean) => void;
  setShowSetupInstructions: (value: boolean) => void;
  setSidebarWidth: (value: number) => void;
  setZoomPan: (value: boolean) => void;
  toggleClearDrawingsOnPlay: () => void;
  toggleSlowCPUMode: () => void;
}

const emptyState: StateData = {
  arrowKeyJumpDistance: '10.00',
  clearDrawingsOnPlay: true,
  shownFirstHelpReview: false,
  shownFirstHelpSetup: false,
  showSetupInstructions: true,
  sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
  slowCPUMode: false,
  zoomPanEnabled: false,
};

const serialize = (state: object) => {
  return JSON.stringify(state);
};

const deserialize = (str: string) => {
  const returning = JSON.parse(str);

  if (!returning.state.sidebarWidth) {
    returning.state.sidebarWidth = DEFAULT_SIDEBAR_WIDTH;
  }

  return returning;
};

const useStore = createStore<State>(
  persist(
    (set) => ({
      setArrowKeyJumpDistance: (seconds) =>
        set(() => ({ arrowKeyJumpDistance: seconds })),
      setShownFirstHelpReview: (shownFirstHelpReview) =>
        set(() => ({ shownFirstHelpReview })),
      setShownFirstHelpSetup: (shownFirstHelpSetup) =>
        set(() => ({ shownFirstHelpSetup })),
      setShowSetupInstructions: (value) =>
        set(() => ({ showSetupInstructions: value })),
      setSidebarWidth: (sidebarWidth) => set(() => ({ sidebarWidth })),
      setZoomPan: (value) => set(() => ({ zoomPanEnabled: value })),
      toggleClearDrawingsOnPlay: () =>
        set((state) => ({ clearDrawingsOnPlay: !state.clearDrawingsOnPlay })),
      toggleSlowCPUMode: () =>
        set((state) => ({ slowCPUMode: !state.slowCPUMode })),
      ...emptyState,
    }),
    {
      name: 'vodon-store-settings-v3',
      version: CURRENT_PERSIST_VERSION,
      serialize,
      deserialize,
    }
  )
);

export default useStore;
