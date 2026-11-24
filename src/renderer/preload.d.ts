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
      onSaveProjectRequest: (cb: () => void) => void;
      /** Writes to the file the user chose in the save dialog */
      saveProject: (project: string) => Promise<void>;
    };

    video: {
      exists: (filepath: string) => Promise<boolean>;
      getMetadata: (filepath: string) => Promise<VideoMetadata>;
      /** Path on disk of a dropped/picked file, '' if it has none */
      getPathForFile: (file: File) => string;
    };
  }
}
