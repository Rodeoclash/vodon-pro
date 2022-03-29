import { v4 as uuidv4 } from "uuid";
import { basename } from "../file";

export type Video = {
  /** Average framerate of the video */
  frameRate: number;

  /** Base duration of the video */
  duration: number | null;

  /** Normalised offset + duration */
  durationNormalised: number | null;

  /** Video element used for playback */
  el: HTMLVideoElement;

  /** Path to the file on disk */
  filePath: string;

  /** Unique id for this video */
  id: string;

  /** Name of this video (usually the player who was recorded) */
  name: string;

  /** User selected offset to align the video against others in the set */
  offset: number;

  /** Offset less the smallest shared offset */
  offsetNormalised: number;

  /** Stored volume */
  volume: number;

  /** Aspect ratio of the video */
  displayAspectRatio: string;
};

type VideoConstructorAttrs = {
  displayAspectRatio: string;
  filePath: string;
  frameRate: number;
  name: string;
};

type AudioStreamMetadata = {
  codec_type: "audio";
};

type VideoStreamMetadata = {
  index: number;
  codec_type: "video";
  avg_frame_rate: string;
  displayAspectRatio: string;
};

export type VideoMetadata = {
  streams: Array<VideoStreamMetadata | AudioStreamMetadata>;
};

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
    const durationNormalised = video.durationNormalised;

    if (acc === null || durationNormalised > acc) {
      return durationNormalised;
    }

    return acc;
  }, null);
}

export async function createFromFile(filePath: string): Promise<Video> {
  const metadata = await window.video.getMetadata(filePath);

  console.log(metadata);

  // extract video stream
  const videoStream = metadata.streams.find((stream: VideoStreamMetadata | AudioStreamMetadata) => {
    return stream.codec_type === "video";
  });

  // determine framerate
  const [ratio_1, ratio_2] = videoStream.avg_frame_rate.split("/");
  const frameRate = Math.round(parseInt(ratio_1, 10) / parseInt(ratio_2));

  // video element
  const el = document.createElement("video");
  el.src = filePath;

  return {
    displayAspectRatio: videoStream.displayAspectRatio,
    duration: null,
    durationNormalised: null,
    el,
    filePath,
    frameRate,
    id: uuidv4(),
    name: basename(filePath),
    offset: 0,
    offsetNormalised: 0,
    volume: 0.8,
  };
}
