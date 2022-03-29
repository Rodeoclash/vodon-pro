declare module "*.module.css";
declare module "*.otf";
declare module "@ffprobe-installer/ffprobe";
declare module "fluent-ffmpeg";

interface Window {
  app: {
    getVersion: () => Promise<string>;
  };

  video: {
    getMetadata: (filepath: string) => Promise<VideoMetadata>;
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
