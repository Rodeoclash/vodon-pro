const { contextBridge, ipcRenderer } = require("electron");

import type { VideoMetadata } from "./services/models/Video";

contextBridge.exposeInMainWorld("app", {
  getVersion: () => ipcRenderer.invoke("app:getVersion"),
});

contextBridge.exposeInMainWorld("video", {
  getMetadata: (filePath: string) => ipcRenderer.invoke("video:getMetadata", filePath),
});
