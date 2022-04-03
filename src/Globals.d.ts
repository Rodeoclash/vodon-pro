declare module "*.module.css";
declare module "*.otf";
declare module "@ffprobe-installer/ffprobe";
declare module "fluent-ffmpeg";

interface Window {
  app: {
    getVersion: () => Promise<string>;
    onSaveProjectRequest: (cb: (event: any, filePath: string) => void) => void;
    onLoadProjectRequest: (cb: (event: any, project: string) => void) => void;
    saveProject: (filePath: string, project: string) => Promise<string>;
  };

  video: {
    getMetadata: (filepath: string) => Promise<VideoMetadata>;
    exists: (filepath: string) => Promise<boolean>;
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
