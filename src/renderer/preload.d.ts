import * as fs from 'fs';
import type { VideoMetadata } from './services/models/Video';

declare global {
  interface Window {
    app: {
      getVersion: () => Promise<string>;
      onNewProjectRequest: (cb: (event: any) => void) => void;
      onLoadProjectRequest: (cb: (event: any, project: string) => void) => void;
      onSaveProjectRequest: (
        cb: (event: any, filePath: string) => void
      ) => void;
      saveProject: (filePath: string, project: string) => Promise<string>;
    };

    video: {
      exists: (filepath: string) => Promise<boolean>;
      getMetadata: (filepath: string) => Promise<VideoMetadata>;
      screenshot: (filepath: string, second: number) => Promise<fs.ReadStream>;
    };
  }
}

export {};
