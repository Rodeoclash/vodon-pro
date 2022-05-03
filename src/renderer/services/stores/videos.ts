import createStore from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';
import superjson from 'superjson';

import { findMaxNormalisedDuration } from '../models/Video';
import { create as createVideoBookmark } from '../models/VideoBookmark';

import type { Video } from '../models/Video';
import type {
  VideoBookmark,
  VideoBookmarkCoordinates,
} from '../models/VideoBookmark';

const PERSIST_VERSION = 0;

interface StateData {
  activeVideoId: string | null;
  currentTime: number;
  editingBookmark: boolean;
  fullDuration: number | null;
  playbackSpeed: number;
  playing: boolean;
  videos: Video[];
}

interface State extends StateData {
  addVideo: (video: Video) => void;
  clearVideos: () => void;

  removeVideo: (video: Video) => void;
  setActiveVideoId: (id: string | null) => void;
  setCurrentTime: (currentTime: number) => void;
  setVideoDuration: (video: Video, duration: number) => void;
  setVideoName: (video: Video, name: string) => void;
  setVideoSyncTime: (video: Video, offset: number) => void;
  recalculateOffsets: () => void;
  setVideoVolume: (video: Video, volume: number) => void;

  // playing
  startPlaying: () => void;
  stopPlaying: () => void;
  togglePlaying: () => void;
  setPlaybackSpeed: (playbackSpeed: number) => void;

  // bookmarks
  createVideoBookmark: (
    video: Video,
    content: string,
    time: number,
    scale: number,
    drawing: object
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
}

const emptyState: StateData = {
  activeVideoId: null,
  currentTime: 0,
  editingBookmark: false,
  fullDuration: null,
  playbackSpeed: 1,
  playing: false,
  videos: [],
};

// remove video elements
const serialize = (state: any) => {
  const updatedState = produce(state.state, (innerState: State) => {
    innerState.videos = innerState.videos.map((video) => {
      return {
        ...video,
        el: null,
      };
    });
  });

  return superjson.stringify({ ...state, state: updatedState });
};

// When restoring state, we need to handle videos that might have been moved
// TODO: This should register an error or similar that the video was removed
const deserialize = async (str: string) => {
  const parsedStr: any = superjson.parse(str);

  const videos = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const video of parsedStr.state.videos) {
    // handle missing videos
    // eslint-disable-next-line no-await-in-loop
    const exists = await window.video.exists(video.filePath);

    if (exists === false) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // populate bookmarks onto videos if needed
    if (!video.bookmarks) {
      video.bookmarks = [];
    }

    const el = document.createElement('video');
    el.src = video.filePath;

    videos.push({
      ...video,
      el,
    });
  }

  return {
    version: parsedStr.version,
    state: {
      ...parsedStr.state,
      videos,
    },
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
        set((state) => ({
          ...state,
          ...emptyState,
        })),

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

      setVideoSyncTime: (video: Video, syncTime: number) =>
        set(
          produce((state: State) => {
            const index = state.videos.findIndex((innerVideo) => {
              return innerVideo.id === video.id;
            });

            state.videos[index].syncTime = syncTime;
          })
        ),

      /**
       * Other videos do exist so we need to calculate the offset of them
       * relative to each other. The first video is used as our anchor
       * so we may end up with negative and positive offsets.
       */
      recalculateOffsets: () =>
        set(
          produce((state: State) => {
            state.videos
              .sort((a, b) => (a.duration || 0) - (b.duration || 0))
              .forEach((video, idx) => {
                if (idx === 0) {
                  video.offset = 0;
                  video.durationNormalised = video.duration;
                  return;
                }

                video.offset = state.videos[0].syncTime - video.syncTime;
                video.durationNormalised = video.offset + (video.duration || 0);
              });

            state.videos.sort(
              (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
            );

            state.fullDuration = findMaxNormalisedDuration(state.videos);
          })
        ),

      createVideoBookmark: (
        video: Video,
        content: string,
        time: number,
        scale: number,
        drawing: object
      ) =>
        set(
          produce((state: State) => {
            const index = state.videos.findIndex((innerVideo) => {
              return innerVideo.id === video.id;
            });

            const bookmark = createVideoBookmark(content, time, scale, drawing);

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
      setPlaybackSpeed: (playbackSpeed: number) =>
        set((state) => ({ playbackSpeed })),

      startEditingBookmark: () => set((state) => ({ editingBookmark: true })),
      stopEditingBookmark: () => set((state) => ({ editingBookmark: false })),

      ...emptyState,
    }),
    {
      name: 'vodon-store-videos-v1',
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
 * Handle the new project request from the main thread. Just reset everything
 * back to new.
 */
window.app.onNewProjectRequest(async (event: any) => {
  if (window.confirm('This will remove all videos and bookmarks, continue?')) {
    useStore.setState({
      ...useStore.getState(),
      ...emptyState,
    });
  }
});
