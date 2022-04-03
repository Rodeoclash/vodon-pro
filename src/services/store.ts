import createStore from "zustand";
import { persist } from "zustand/middleware";
import { produce } from "immer";

import { findMinOffset, findMaxNormalisedDuration } from "./models/Video";

import type { Video } from "./models/Video";

const PERSIST_VERSION = 0;

interface State {
  addVideo: (video: Video) => void;
  clearVideos: () => void;
  removeVideo: (video: Video) => void;
  setActiveVideoId: (id: string | null) => void;
  setCurrentTime: (currentTime: number) => void;
  setShowSetupInstructions: (value: boolean) => void;
  setVideoDuration: (video: Video, duration: number) => void;
  setVideoName: (video: Video, name: string) => void;
  setVideoOffset: (video: Video, offset: number) => void;
  setVideoVolume: (video: Video, volume: number) => void;
  startPlaying: () => void;
  stopPlaying: () => void;
  togglePlaying: () => void;
  toggleSlowCPUMode: () => void;

  activeVideoId: string | null;
  currentTime: number;
  maxDuration: number | null;
  playing: boolean;
  showSetupInstructions: boolean | undefined;
  slowCPUMode: boolean;
  videos: Video[];
}

// remove video elements
const serialize = (state: any) => {
  const updatedState = produce(state.state, (state: State) => {
    state.videos = state.videos.map((video) => {
      return {
        ...video,
        el: null,
      };
    });
  });

  return JSON.stringify({ ...state, state: updatedState });
};

// When restoring state, we need to handle videos that might have been moved
// TODO: This should register an error or similar that the video was removed
const deserialize = async (str: string) => {
  const parsedStr = JSON.parse(str);

  const updatedState = await produce(parsedStr.state, async (state: State) => {
    let videos = [];

    for (const video of state.videos) {
      const exists = await window.video.exists(video.filePath);

      if (exists === false) {
        continue;
      }

      const el = document.createElement("video");
      el.src = video.filePath;

      videos.push({
        ...video,
        el,
      });
    }

    state.videos = videos;
  });

  return {
    ...parsedStr,
    state: updatedState,
  };
};

const useStore = createStore<State>(
  persist(
    (set, get) => ({
      /**
       * Video control
       */
      addVideo: (video: Video) =>
        set((state) => ({
          activeVideoId: state.activeVideoId === null || state.videos.length === 0 ? video.id : state.activeVideoId,
          videos: state.videos.concat([video]),
        })),

      removeVideo: (video: Video) =>
        set(
          produce((state: State) => {
            state.videos = state.videos.filter((innerVideo) => {
              return video.id !== innerVideo.id;
            });
          })
        ),

      clearVideos: () =>
        set(
          produce((state: State) => {
            state.videos = [];
          })
        ),

      // TODO: Combine with name update
      setVideoDuration: (video: Video, duration: number) =>
        set(
          produce((state: State) => {
            const index = state.videos.findIndex((innerVideo) => {
              return innerVideo.id === video.id;
            });

            state.videos[index].duration = duration;
          })
        ),

      // TODO: Combine with duration update
      setVideoName: (video: Video, name: string) =>
        set(
          produce((state: State) => {
            const index = state.videos.findIndex((innerVideo) => {
              return innerVideo.id === video.id;
            });

            state.videos[index].name = name;
          })
        ),

      // TODO: Combine with duration update
      setVideoVolume: (video: Video, volume: number) =>
        set(
          produce((state: State) => {
            const index = state.videos.findIndex((innerVideo) => {
              return innerVideo.id === video.id;
            });

            state.videos[index].volume = volume;
          })
        ),

      setVideoOffset: (video: Video, offset: number) =>
        set(
          produce((state: State) => {
            const index = state.videos.findIndex((innerVideo) => {
              return innerVideo.id === video.id;
            });

            // update the set state
            state.videos[index].offset = offset;

            // recalculate the normalised offset and store against all the videos
            const minimumOffset = findMinOffset(state.videos);

            state.videos.forEach((video) => {
              video.offsetNormalised = video.offset - minimumOffset;
              video.durationNormalised = video.duration + video.offsetNormalised;
            });

            // Set the max duration of all the videos. This is used to construct the global slider
            state.maxDuration = findMaxNormalisedDuration(state.videos);
          })
        ),

      setActiveVideoId: (id: string | null) => set((state) => ({ activeVideoId: id })),

      /**
       * Play control
       */
      setCurrentTime: (currentTime: number) =>
        set((state) => {
          return {
            currentTime,
          };
        }),
      startPlaying: () => set((state) => ({ playing: true })),
      stopPlaying: () => set((state) => ({ playing: false })),
      togglePlaying: () => set((state) => ({ playing: !state.playing })),

      toggleSlowCPUMode: () => set((state) => ({ slowCPUMode: !state.slowCPUMode })),
      setShowSetupInstructions: (value) => set((state) => ({ showSetupInstructions: value })),

      activeVideoId: null,
      currentTime: 0,
      maxDuration: null,
      playing: false,
      showSetupInstructions: true,
      slowCPUMode: false,
      videos: [],
    }),
    {
      name: "vodon-store-v1",
      version: PERSIST_VERSION,
      serialize,
      deserialize,
    }
  )
);

export default useStore;

/**
 * Handle the save request from the main thread. Calculate the current state
 * then pass it back to the main thread along with the filepath to persist.
 */
window.app.onSaveProjectRequest((event: any, filePath: string) => {
  const serializedState = serialize({
    version: PERSIST_VERSION,
    state: useStore.getState(),
  });

  window.app.saveProject(filePath, serializedState);
});

/**
 * Handle the save request from the main thread. Calculate the current state
 * then pass it back to the main thread along with the filepath to persist.
 */
window.app.onLoadProjectRequest(async (event: any, project: string) => {
  const unserializedState = await deserialize(project);
  useStore.setState(unserializedState.state);
});
