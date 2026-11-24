import type { VideoMetadata } from './services/models/Video';

declare global {
  interface Window {
    app: {
      getVersion: () => Promise<string>;
      getArgv: () => Promise<Array<string>>;
      openBrowser: (url: string) => void;
      onLoadAdditionalVideos: (cb: (paths: Array<string>) => void) => void;
      onNewProjectRequest: (cb: () => void) => void;
      onLoadProjectRequest: (cb: (project: string) => void) => void;
      onSaveProjectRequest: (cb: (filePath: string) => void) => void;
      saveProject: (filePath: string, project: string) => Promise<string>;
    };

    video: {
      exists: (filepath: string) => Promise<boolean>;
      getMetadata: (filepath: string) => Promise<VideoMetadata>;
      /** Path on disk of a dropped/picked file, '' if it has none */
      getPathForFile: (file: File) => string;
    };
  }
}
