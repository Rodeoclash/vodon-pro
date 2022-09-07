import { v4 as uuidv4 } from 'uuid';
import { Video } from './Video';

export type VideoBookmarkIcon = {
  native: string;
};

export type VideoBookmarkCoordinates = {
  x: number;
  y: number;
};

export type VideoBookmark = {
  /** Unique id for this bookmark */
  id: string;

  /** The icon of this bookmark */
  icon: VideoBookmarkIcon;

  /** Content about what the bookmark is */
  content: string;

  /** What time the bookmark is located */
  time: number;

  /** Position on the screen of the bookmark */
  position: VideoBookmarkCoordinates | null;

  /** Drawing associated with the bookmark */
  drawing: object | null;

  /** The scale the bookmark was created at */
  scale: number;

  /** What video this bookmark belongs to */
  video_id: string;
};

export function create(
  video: Video,
  content: string,
  time: number,
  scale: number,
  drawing: object
): VideoBookmark {
  return {
    content,
    drawing: JSON.parse(JSON.stringify(drawing)),
    id: uuidv4(),
    icon: {
      native: '🔖',
    },
    position: null,
    scale,
    time,
    video_id: video.id,
  };
}
