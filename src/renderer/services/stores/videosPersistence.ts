import superjson from 'superjson';
import { mediaUrl } from '../../../shared/mediaUrl';
import type { Video } from '../models/Video';

/** What zustand's persist middleware (and project files) store. */
export type Persisted<S> = {
  state: S;
  version?: number;
};

/** A video as written to storage: its element can't be serialised. */
export type StoredVideo = Omit<Video, 'el'> & { el: null };

type WithVideos = { videos: Video[]; zoomPanEnabled: boolean };

type StoredState<S extends WithVideos> = Omit<S, 'videos'> & {
  videos: StoredVideo[];
};

/**
 * Serialise the video store for localStorage or a project file, dropping each
 * video's element.
 */
export function serialize<S extends WithVideos>(value: Persisted<S>): string {
  const videos: StoredVideo[] = value.state.videos.map((video) => ({
    ...video,
    el: null,
  }));

  return superjson.stringify({ ...value, state: { ...value.state, videos } });
}

type DeserializeOptions = {
  /** Whether the file still exists on disk. */
  exists?: (filePath: string) => Promise<boolean>;
};

/**
 * Restore the video store, skipping videos whose files have gone and creating
 * a fresh element for each one that remains. Pan and zoom always start off.
 */
export async function deserialize<S extends WithVideos>(
  str: string,
  {
    exists = (filePath) => window.video.exists(filePath),
  }: DeserializeOptions = {},
): Promise<Persisted<S>> {
  const parsed = superjson.parse<Persisted<StoredState<S>>>(str);

  const videos: Video[] = [];

  for (const video of parsed.state.videos) {
    // TODO: tell the user when a video has been moved or deleted
    if (!(await exists(video.filePath))) continue;

    const el = document.createElement('video');
    el.src = mediaUrl(video.filePath);

    videos.push({ ...video, el });
  }

  return {
    version: parsed.version,
    state: {
      ...parsed.state,
      zoomPanEnabled: false,
      videos,
    } as unknown as S,
  };
}
