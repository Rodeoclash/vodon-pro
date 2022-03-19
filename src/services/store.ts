import React from "react";
import create from "zustand";

export interface Video {
  id: string;
  name: string;
  file: File;
  el: HTMLVideoElement;
  volume: number;
}

interface StoreState {
  addVideo: (video: Video) => void;
  setActiveVideoId: (id: string | null) => void;
  startPlaying: () => void;
  stopPlaying: () => void;

  activeVideoId: null | string;
  playing: boolean;
  videos: Video[];
}

const useStore = create<StoreState>((set) => ({
  addVideo: (video: Video) => set((state) => ({ videos: state.videos.concat([video]) })),
  setActiveVideoId: (id: string | null) => set((state) => ({ activeVideoId: id })),
  startPlaying: () => set((state) => ({ playing: true })),
  stopPlaying: () => set((state) => ({ playing: false })),

  activeVideoId: null,
  playing: false,
  videos: [],
}));

export default useStore;
