import create from "zustand";
import { produce } from "immer";

export interface Video {
  /** Base duration of the video */
  duration: number | null;

  /** Base video duration plus the normalisedOffset */
  durationNormalised: number | null;
  el: HTMLVideoElement;
  file: File;
  id: string;
  name: string;

  /** User selected offset to align the video against others in the set */
  offset: number;

  /** Offset (in seconds) normalised against other video offsets in the set */
  offsetNormalised: number | null;
  volume: number;
}

interface State {
  addVideo: (video: Video) => void;
  setVideoDuration: (video: Video, duration: number) => void;
  setVideoOffset: (video: Video, offset: number) => void;
  setActiveVideoId: (id: string | null) => void;
  startPlaying: () => void;
  stopPlaying: () => void;

  activeVideoId: null | string;
  playing: boolean;
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

const useStore = create<State>((set) => ({
  addVideo: (video: Video) => set((state) => ({ videos: state.videos.concat([video]) })),

  setVideoDuration: (video: Video, duration: number) =>
    set(
      produce((state: State) => {
        const index = state.videos.findIndex((innerVideo) => {
          return innerVideo.id === video.id;
        });

        state.videos[index].duration = duration;
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

        console.log(JSON.stringify(state.videos, null, 2));
      })
    ),

  setActiveVideoId: (id: string | null) => set((state) => ({ activeVideoId: id })),
  startPlaying: () => set((state) => ({ playing: true })),
  stopPlaying: () => set((state) => ({ playing: false })),

  activeVideoId: null,
  playing: false,
  videos: [],
}));

export default useStore;
