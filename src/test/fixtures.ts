import type { Video } from '../renderer/services/models/Video';
import type { VideoBookmark } from '../renderer/services/models/VideoBookmark';

export function buildVideo(overrides: Partial<Video> = {}): Video {
  return {
    bookmarks: [],
    codedHeight: 1080,
    codedWidth: 1920,
    createdAt: new Date('04 Dec 1995 00:12:00 GMT'),
    displayAspectRatio: '16/9',
    duration: null,
    durationNormalised: null,
    el: document.createElement('video'),
    filePath: 'c:\\video.mp4',
    frameRate: 60,
    id: '1',
    name: 'A Video',
    offset: null,
    seeking: false,
    syncTime: 0,
    volume: 1,
    ...overrides,
  };
}

export function buildVideoBookmark(
  overrides: Partial<VideoBookmark> = {},
): VideoBookmark {
  return {
    content: '',
    drawing: null,
    id: '1',
    icon: { native: '🔖' },
    position: { x: 0, y: 0 },
    time: 1,
    scale: 1,
    video_id: '1',
    ...overrides,
  };
}
