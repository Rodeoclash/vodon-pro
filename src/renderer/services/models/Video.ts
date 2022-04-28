import { v4 as uuidv4 } from 'uuid';
import { basename } from '../file';

import type { VideoBookmark } from './VideoBookmark';

export type Video = {
  /** Average framerate of the video */
  frameRate: number;

  /** Base duration of the video */
  duration: number | null;

  /** Offset + duration */
  durationNormalised: number | null;

  /** Video element used for playback */
  el: HTMLVideoElement | null;

  /** Path to the file on disk */
  filePath: string;

  /** Unique id for this video */
  id: string;

  /** Name of this video (usually the player who was recorded) */
  name: string;

  /** Calculated offset from the global start (relative to other videos) */
  offset: number | null;

  /** What time in this video is the "shared moment" with the other videos */
  syncTime: number;

  /** Stored volume */
  volume: number;

  /** Aspect ratio of the video */
  displayAspectRatio: string;

  /** List of bookmarks stored against this video */
  bookmarks: VideoBookmark[];

  /** Width of the video in px, used to calculate scaling */
  codedWidth: number;

  /* Height of the video in px */
  codedHeight: number;

  /** Date of created video */
  createdAt: Date;
};

type AudioStreamMetadata = {
  codec_type: 'audio';
};

type VideoStreamMetadata = {
  index: number;
  codec_type: 'video';
  avg_frame_rate: string;
  display_aspect_ratio: string;
};

export type VideoMetadata = {
  streams: Array<VideoStreamMetadata | AudioStreamMetadata>;
};

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
  console.log('createFromFile filepath', filePath)
  const metadata = await window.video.getMetadata(filePath);
  console.log('metadata was', metadata)

  // extract video stream
  const videoStream = metadata.streams.find(
    (stream: VideoStreamMetadata | AudioStreamMetadata) => {
      return stream.codec_type === 'video';
    }
  );

  // determine framerate
  const [ratio_1, ratio_2] = videoStream.avg_frame_rate.split('/');
  const frameRate = Math.round(parseInt(ratio_1, 10) / parseInt(ratio_2));

  // video element
  const el = document.createElement('video');
  el.src = filePath;

  return {
    bookmarks: [],
    codedHeight: videoStream.coded_height,
    codedWidth: videoStream.coded_width,
    createdAt: new Date(),
    displayAspectRatio: videoStream.display_aspect_ratio,
    duration: null,
    durationNormalised: null,
    el,
    filePath,
    frameRate,
    id: uuidv4(),
    name: basename(filePath),
    offset: null,
    syncTime: 0,
    volume: 0.8,
  };
}
