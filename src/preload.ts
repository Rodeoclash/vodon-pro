const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("app", {
  getVersion: () => ipcRenderer.invoke("app:getVersion"),
  saveProject: (filePath: string, project: string) => ipcRenderer.invoke("app:saveProject", filePath, project),
  onSaveProjectRequest: (callback: (event: any, filePath: string) => void) =>
    ipcRenderer.on("onSaveProjectRequest", callback),
  onLoadProjectRequest: (callback: (event: any, project: string) => void) =>
    ipcRenderer.on("onLoadProjectRequest", callback),
  onVideoThumbnailGenerationProgress: (callback: (event: any, progress: VideoThumbnailGenerationProgress) => void) =>
    ipcRenderer.on("onVideoThumbnailGenerationProgress", callback),
});

contextBridge.exposeInMainWorld("video", {
  exists: (filePath: string) => ipcRenderer.invoke("video:exists", filePath),
  getMetadata: (filePath: string) => ipcRenderer.invoke("video:getMetadata", filePath),
  generateThumbnails: (filePath: string) => ipcRenderer.invoke("video:generateThumbnails", filePath),
});
