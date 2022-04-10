import { v4 as uuidv4 } from "uuid";

export type VideoBookmark = {
  /** Unique id for this bookmark */
  id: string;

  /** Content about what the bookmark is */
  content: string;

  /** What time the bookmark is located */
  time: number;
};

export function create(content: string, time: number): VideoBookmark {
  return {
    id: uuidv4(),
    content,
    time,
  };
}
