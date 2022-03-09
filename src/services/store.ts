import create from "zustand";

interface Video {
  name: string;
}

interface StoreState {
  videos: Video[];
}

const useStore = create<StoreState>((set) => ({
  videos: [],
  addVideo: (video: Video) => set((state) => ({ videos: state.videos.concat([video]) })),
}));

export default useStore;
