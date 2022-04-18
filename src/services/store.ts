import createStore from "zustand";
import { persist } from "zustand/middleware";
import { produce } from "immer";

import { findMinOffset, findMaxNormalisedDuration } from "./models/Video";
import { create as createVideoBookmark } from "./models/VideoBookmark";

import type { Video } from "./models/Video";
import type { VideoBookmark } from "./models/VideoBookmark";
import type { VideoBookmarkCoordinates } from "./models/VideoBookmark";

const PERSIST_VERSION = 1;

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
  toggleSlowCPUMode: () => void;

  // playing
  startPlaying: () => void;
  stopPlaying: () => void;
  togglePlaying: () => void;

  // bookmarks
  createVideoBookmark: (
    video: Video,
    content: string,
    time: number,
    scale: number
  ) => void;
  deleteVideoBookmark: (video: Video, bookmark: VideoBookmark) => void;
  startEditingBookmark: () => void;
  stopEditingBookmark: () => void;
  setVideoBookmarkCoords: (
    video: Video,
    bookmark: VideoBookmark,
    coords: VideoBookmarkCoordinates,
    scale: number
  ) => void;
  setVideoBookmarkContent: (
    video: Video,
    bookmark: VideoBookmark,
    content: string
  ) => void;
  setVideoBookmarkDrawing: (
    video: Video,
    bookmark: VideoBookmark,
    drawing: object
  ) => void;

  activeVideoId: string | null;
  currentTime: number;
  editingBookmark: boolean;
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
      // handle missing videos
      const exists = await window.video.exists(video.filePath);

      if (exists === false) {
        continue;
      }

      // populate bookmarks onto videos if needed
      if (!video.bookmarks) {
        video.bookmarks = [];
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
          activeVideoId:
            state.activeVideoId === null || state.videos.length === 0
              ? video.id
              : state.activeVideoId,
          currentTime: 0,
          videos: state.videos.concat([video]),
        })),

      removeVideo: (video: Video) =>
        set(
          produce((state: State) => {
            state.videos = state.videos.filter((innerVideo) => {
              return video.id !== innerVideo.id;
            });
            state.activeVideoId =
              state.videos.length === 1
                ? state.videos[0].id
                : state.activeVideoId;
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
              video.durationNormalised =
                video.duration + video.offsetNormalised;
            });

            // Set the max duration of all the videos. This is used to construct the global slider
            state.maxDuration = findMaxNormalisedDuration(state.videos);
          })
        ),

      createVideoBookmark: (
        video: Video,
        content: string,
        time: number,
        scale: number
      ) =>
        set(
          produce((state: State) => {
            const index = state.videos.findIndex((innerVideo) => {
              return innerVideo.id === video.id;
            });

            const bookmark = createVideoBookmark(content, time, scale);

            state.videos[index].bookmarks.push(bookmark);
          })
        ),

      /**
       * Removes a bookmark from a video
       * @param video Video Video that contains the bookmark
       * @param bookmark VideoBookmark The video bookmark to be removed
       * @returns void
       */
      deleteVideoBookmark: (video: Video, bookmark: VideoBookmark) =>
        set(
          produce((state: State) => {
            const videoIndex = state.videos.findIndex((innerVideo) => {
              return innerVideo.id === video.id;
            });

            state.videos[videoIndex].bookmarks = state.videos[
              videoIndex
            ].bookmarks.filter((innerBookmark) => {
              return bookmark.id !== innerBookmark.id;
            });
          })
        ),

      /**
       * Sets the coordinates of a bookmark, used to load the bookmark in the same place next time it's loaded.
       * @param video Video Video that contains the bookmark
       * @param bookmark VideoBookmark The video bookmark to be updated
       * @param coords Coordinates to update to
       * @returns void
       */
      setVideoBookmarkCoords: (
        video: Video,
        bookmark: VideoBookmark,
        coords: VideoBookmarkCoordinates,
        scale: number
      ) =>
        set(
          produce((state: State) => {
            const videoIndex = state.videos.findIndex((innerVideo) => {
              return innerVideo.id === video.id;
            });

            const bookmarkIndex = state.videos[videoIndex].bookmarks.findIndex(
              (innerBookmark) => {
                return innerBookmark.id === bookmark.id;
              }
            );

            state.videos[videoIndex].bookmarks[bookmarkIndex].position = {
              x: coords.x,
              y: coords.y,
            };

            state.videos[videoIndex].bookmarks[bookmarkIndex].scale = scale;
          })
        ),

      /**
       * Sets the content of a bookmark
       * @param video Video Video that contains the bookmark
       * @param bookmark VideoBookmark The video bookmark to be updated
       * @param coords Content to update to
       * @returns void
       */
      setVideoBookmarkContent: (
        video: Video,
        bookmark: VideoBookmark,
        content: string
      ) =>
        set(
          produce((state: State) => {
            const videoIndex = state.videos.findIndex((innerVideo) => {
              return innerVideo.id === video.id;
            });

            const bookmarkIndex = state.videos[videoIndex].bookmarks.findIndex(
              (innerBookmark) => {
                return innerBookmark.id === bookmark.id;
              }
            );

            state.videos[videoIndex].bookmarks[bookmarkIndex].content = content;
          })
        ),

      /**
       * Sets the content of a bookmark
       * @param video Video Video that contains the bookmark
       * @param bookmark VideoBookmark The video bookmark to be updated
       * @param coords Content to update to
       * @returns void
       */
      setVideoBookmarkDrawing: (
        video: Video,
        bookmark: VideoBookmark,
        drawing: object
      ) =>
        set(
          produce((state: State) => {
            const videoIndex = state.videos.findIndex((innerVideo) => {
              return innerVideo.id === video.id;
            });

            const bookmarkIndex = state.videos[videoIndex].bookmarks.findIndex(
              (innerBookmark) => {
                return innerBookmark.id === bookmark.id;
              }
            );

            state.videos[videoIndex].bookmarks[bookmarkIndex].drawing = drawing;
          })
        ),

      setActiveVideoId: (id: string | null) =>
        set((state) => ({ activeVideoId: id })),

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

      startEditingBookmark: () => set((state) => ({ editingBookmark: true })),
      stopEditingBookmark: () => set((state) => ({ editingBookmark: false })),

      toggleSlowCPUMode: () =>
        set((state) => ({ slowCPUMode: !state.slowCPUMode })),
      setShowSetupInstructions: (value) =>
        set((state) => ({ showSetupInstructions: value })),

      activeVideoId: null,
      currentTime: 0,
      editingBookmark: false,
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

/**
 * Handle the save request from the main thread. Calculate the current state
 * then pass it back to the main thread along with the filepath to persist.
 */
window.app.onVideoThumbnailGenerationProgress(
  async (
    event: any,
    { id, thumbnailsDir, percent }: VideoThumbnailGenerationProgress
  ) => {
    useStore.setState(
      produce(useStore.getState(), (state: State) => {
        const index = state.videos.findIndex((innerVideo) => {
          return innerVideo.id === id;
        });

        state.videos[index].thumbnailGenerationProgress = percent;
        state.videos[index].thumbnailGenerationLocation = thumbnailsDir;
      })
    );
  }
);
