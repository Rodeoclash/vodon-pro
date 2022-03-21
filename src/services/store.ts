import create from "zustand";
import { produce } from "immer";

export interface Video {
  duration: number | null;
  offset: number;
  el: HTMLVideoElement;
  file: File;
  id: string;
  name: string;
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

        state.videos[index].offset = offset;
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
