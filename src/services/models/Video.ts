import { v4 as uuidv4 } from "uuid";

export type VideoConstructorAttrs = {
  filePath: string;
  name: string;
};

type AudioStreamMetadata = {
  codec_type: "audio";
};

type VideoStreamMetadata = {
  index: number;
  codec_type: "video";
  avg_frame_rate: string;
  duration: number;
};

export type VideoMetadata = {
  streams: Array<VideoStreamMetadata | AudioStreamMetadata>;
};

export default class Video {
  /** Average framerate of the video */
  frameRate: number | null;

  /** Base duration of the video */
  duration: number | null;

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

  /** Stored volume */
  volume: number;

  /** Metadata about the video returned by ffprobe */
  metadata: VideoMetadata | null;

  /** Metadata about the video returned by ffprobe */
  videoStream: VideoStreamMetadata | null;

  // Finds the minimum offset on the videos. This is used to set the normalised offset.
  static findMinOffset(videos: Video[]): number | null {
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
  /*
  static findMaxNormalisedDuration(videos: Video[]): number | null {
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
  */

  constructor({ name, filePath }: VideoConstructorAttrs) {
    this.id = uuidv4();
    this.name = name;
    this.filePath = filePath;
    this.el = document.createElement("video");
    this.volume = 0.8;
    this.offset = 0;
    this.metadata = null;
    this.videoStream = null;
  }

  /**
   * Introspects the attached video file path to determine framerate, duration, aspect ratio etc
   */
  async updateMetadata() {
    this.metadata = await window.video.getMetadata(this.filePath);

    // extract video stream
    this.videoStream = this.metadata.streams.find((stream): stream is VideoStreamMetadata => {
      return stream.codec_type === "video";
    });

    // determine framerate
    const [ratio_1, ratio_2] = this.videoStream.avg_frame_rate.split("/");
    this.frameRate = Math.round(parseInt(ratio_1, 10) / parseInt(ratio_2));

    // determine duration
    this.duration = this.videoStream.duration;
  }

  /**
   * Returns a normalised offset (the set offset, less the smallest offset of all videos)
   * @param minimumOffset Smallest offset found in all the videos
   */
  offsetNormalised(baselineOffset: number): number {
    return this.offset - baselineOffset;
  }

  /**
   * Returns the duration of the video including the normalised offset
   * @param normalisedOffset The normalised offset of all the videos
   */
  durationNormalised(normalisedOffset: number): number {
    return this.duration + normalisedOffset;
  }
}
