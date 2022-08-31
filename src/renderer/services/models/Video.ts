/* eslint-disable @typescript-eslint/ban-ts-comment */
import { v4 as uuidv4 } from 'uuid';
import { basename } from '../file';

import type { VideoBookmark } from './VideoBookmark';

export type Video = {
  /** List of bookmarks stored against this video */
  bookmarks: VideoBookmark[];

  /** Width of the video in px, used to calculate scaling */
  codedWidth: number;

  /* Height of the video in px */
  codedHeight: number;

  /** Date of created video */
  createdAt: Date;

  /** Aspect ratio of the video */
  displayAspectRatio: string;

  /** Base duration of the video */
  duration: number | null;

  /** Offset + duration */
  durationNormalised: number | null;

  /** Video element used for playback */
  el: HTMLVideoElement;

  /** Path to the file on disk */
  filePath: string;

  /** Average framerate of the video */
  frameRate: number;

  /** Unique id for this video */
  id: string;

  /** Name of this video (usually the player who was recorded) */
  name: string;

  /** Calculated offset from the global start (relative to other videos) */
  offset: number | null;

  /** Is this video currently seeking */
  seeking: boolean;

  /** What time in this video is the "shared moment" with the other videos */
  syncTime: number;

  /** Stored volume */
  volume: number;
};

type AudioStreamMetadata = {
  codec_type: 'audio';
};

type VideoStreamMetadata = {
  avg_frame_rate: string;
  codec_type: 'video';
  coded_height: number;
  coded_width: number;
  display_aspect_ratio: string;
  index: number;
};

export type VideoMetadata = {
  streams: Array<VideoStreamMetadata | AudioStreamMetadata>;
};

/**
 * Given a list of videos, finds the max normalised duration from them.
 * Handles, empty video lists and null normalised duration values.
 */
export function findMaxNormalisedDuration(videos: Video[]): number | null {
  if (videos.length === 0) {
    return null;
  }

  return videos.reduce(
    (acc: number | null, { durationNormalised }: Video): number | null => {
      if (durationNormalised === null) {
        return acc;
      }

      if (acc === null || durationNormalised > acc) {
        return durationNormalised;
      }

      return acc;
    },
    null
  );
}

/**
 * Given a bookmark, find the next available bookmark across all videos.
 */
export function findNextBookmark(
  videos: Array<Video>,
  bookmark: VideoBookmark
): [Video, VideoBookmark] | undefined {
  const bookmarks = videos
    .flatMap((video) => {
      return video.bookmarks;
    })
    .sort((a, b) => {
      return a.time - b.time;
    });

  const foundBookmark = bookmarks.find((innerBookmark) => {
    return innerBookmark.time > bookmark.time;
  });

  if (foundBookmark === undefined) {
    return undefined;
  }

  const foundVideo = videos.find((video) => {
    return foundBookmark.video_id === video.id;
  });

  if (foundVideo === undefined) {
    return undefined;
  }

  return [foundVideo, foundBookmark];
}

/**
 * Given a bookmark, find the previous available bookmark across all videos.
 */
export function findPreviousBookmark(
  videos: Array<Video>,
  bookmark: VideoBookmark
): [Video, VideoBookmark] | undefined {
  const bookmarks = videos
    .flatMap((video) => {
      return video.bookmarks;
    })
    .sort((a, b) => {
      return b.time - a.time;
    });

  const foundBookmark = bookmarks.find((innerBookmark) => {
    return innerBookmark.time < bookmark.time;
  });

  if (foundBookmark === undefined) {
    return undefined;
  }

  const foundVideo = videos.find((video) => {
    return foundBookmark.video_id === video.id;
  });

  if (foundVideo === undefined) {
    return undefined;
  }

  return [foundVideo, foundBookmark];
}

export async function createFromFile(filePath: string): Promise<Video> {
  const metadata = await window.video.getMetadata(filePath);

  // extract video stream
  const videoStream = metadata.streams.find(
    (stream: VideoStreamMetadata | AudioStreamMetadata) => {
      return stream.codec_type === 'video';
    }
  ) as VideoStreamMetadata;

  // determine framerate
  const [ratio1, ratio2] = videoStream.avg_frame_rate.split('/');
  const frameRate = Math.round(parseInt(ratio1, 10) / parseInt(ratio2, 10));

  // video element
  const el = document.createElement('video');
  el.src = filePath;

  // @ts-ignore-start
  el.preservesPitch = false;
  // @ts-ignore-end

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
    seeking: false,
    syncTime: 0,
    volume: 0.8,
  };
}
