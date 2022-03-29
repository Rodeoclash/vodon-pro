import create from "zustand";
import { produce } from "immer";

export interface Video {
  /** Base duration of the video */
  duration: number | null;

  /** Base video duration plus the normalisedOffset */
  durationNormalised: number | null;

  /** Video element used for playback */
  el: HTMLVideoElement;

  /** Path to the file on disk */
  filePath: string;

  /** Unique id for this video */
  id: string;

  /** Frame rate of this video (needs to be determined using FFPROBE) */
  frameRate: number;

  /** Name of this video (usually the player who was recorded) */
  name: string;

  /** User selected offset to align the video against others in the set */
  offset: number;

  /** Offset (in seconds) normalised against other video offsets in the set */
  offsetNormalised: number | null;

  /** Stored volume (TODO: Volume should be dynamic) */
  volume: number;
}

interface State {
  addVideo: (video: Video) => void;
  removeVideo: (video: Video) => void;
  setActiveVideoId: (id: string | null) => void;
  setCurrentTime: (currentTime: number) => void;
  setVideoDuration: (video: Video, duration: number) => void;
  setVideoOffset: (video: Video, offset: number) => void;
  setVideoName: (video: Video, name: string) => void;
  startPlaying: () => void;
  stopPlaying: () => void;
  togglePlaying: () => void;

  activeVideoId: null | string;
  maxDuration: number | null;
  playing: boolean;
  currentTime: number;
  videos: Video[];
}

// Finds the minimum offset on the videos. This is used to set the normalised offset.
export function findMinOffset(videos: Video[]): number | null {
  if (videos.length === 0) {
    return null;
  }

  return videos.reduce(function (acc: number | null, video: Video): number {
    if (acc === null || video.offset < acc) {
      return video.offset;
    }

    return acc;
  }, null);
}

// Finds the max normalised duration of the videos
export function findMaxNormalisedDuration(videos: Video[]): number | null {
  if (videos.length === 0) {
    return null;
  }

  return videos.reduce(function (acc: number | null, video: Video): number {
    if (acc === null || video.durationNormalised > acc) {
      return video.durationNormalised;
    }

    return acc;
  }, null);
}

const useStore = create<State>((set) => ({
  /**
   * Video control
   */
  addVideo: (video: Video) => set((state) => ({ videos: state.videos.concat([video]) })),

  removeVideo: (video: Video) =>
    set(
      produce((state: State) => {
        state.videos = state.videos.filter((innerVideo) => {
          return video.id !== innerVideo.id;
        });
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
        });

        // recalculate the normalised max duration of the videos
        state.videos.forEach((video) => {
          video.durationNormalised = video.offsetNormalised + video.duration;
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

  activeVideoId: null,
  currentTime: 0,
  maxDuration: null,
  playing: false,
  videos: [],
}));

export default useStore;
