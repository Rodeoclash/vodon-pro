declare module "*.module.css";
declare module "*.otf";
declare module "@ffprobe-installer/ffprobe";
declare module "fluent-ffmpeg";

// Passed to the main thread to generate thumbnails
type VideoGenerateThumbnailOptions = {
  id: string;
  filePath: string;
};

// Returned from the main thread, tracks progress of creating thumbnails
type VideoThumbnailGenerationProgress = {
  id: string;
  thumbnailsDir: string;
  percent: number;
};

interface Window {
  app: {
    getVersion: () => Promise<string>;
    onLoadProjectRequest: (cb: (event: any, project: string) => void) => void;
    onSaveProjectRequest: (cb: (event: any, filePath: string) => void) => void;
    onVideoThumbnailGenerationProgress: (cb: (event: any, progress: VideoThumbnailGenerationProgress) => void) => void;
    saveProject: (filePath: string, project: string) => Promise<string>;
  };

  video: {
    exists: (filepath: string) => Promise<boolean>;
    getMetadata: (filepath: string) => Promise<VideoMetadata>;
    generateThumbnails: (options: VideoGenerateThumbnailOptions) => Promise<VideoMetadata>;
  };
}

interface VideoFrameMetadata {
  presentationTime: DOMHighResTimeStamp;
  expectedDisplayTime: DOMHighResTimeStamp;
  width: number;
  height: number;
  mediaTime: number;
  presentedFrames: number;
  processingDuration?: number;
  captureTime?: DOMHighResTimeStamp;
  receiveTime?: DOMHighResTimeStamp;
  rtpTimestamp?: number;
}

type VideoFrameRequestCallbackId = number;

interface HTMLVideoElement extends HTMLMediaElement {
  requestVideoFrameCallback(
    callback: (now: DOMHighResTimeStamp, metadata: VideoFrameMetadata) => any
  ): VideoFrameRequestCallbackId;
  cancelVideoFrameCallback(handle: VideoFrameRequestCallbackId): void;
}
