import { describe, expect, test } from 'vitest';
import { buildVideo, buildVideoBookmark } from '../../../test/fixtures';
import type { Video } from './Video';
import {
  findMaxNormalisedDuration,
  findNextBookmark,
  findPreviousBookmark,
} from './Video';

const baseVideo = buildVideo();
const baseVideoBookmark = buildVideoBookmark();

describe('findMaxNormalisedDuration', () => {
  test('with no videos', () => {
    const videos: Array<Video> = [];

    expect(findMaxNormalisedDuration(videos)).toBe(null);
  });

  test('with 1 video, no durationNormalised', () => {
    const videos: Array<Video> = [
      {
        ...baseVideo,
        durationNormalised: null,
      },
    ];

    expect(findMaxNormalisedDuration(videos)).toBe(null);
  });

  test('with 2 videos, no durationNormalised', () => {
    const videos: Array<Video> = [
      {
        ...baseVideo,
        durationNormalised: null,
      },
      {
        ...baseVideo,
        durationNormalised: null,
      },
    ];

    expect(findMaxNormalisedDuration(videos)).toBe(null);
  });

  test('with 1 video, with durationNormalised', () => {
    const durationNormalised = 500;

    const videos: Array<Video> = [
      {
        ...baseVideo,
        durationNormalised,
      },
    ];

    expect(findMaxNormalisedDuration(videos)).toBe(durationNormalised);
  });

  test('with 2 videos, with durationNormalised', () => {
    const videos: Array<Video> = [
      {
        ...baseVideo,
        durationNormalised: 500,
      },
      {
        ...baseVideo,
        durationNormalised: 600,
      },
    ];

    expect(findMaxNormalisedDuration(videos)).toBe(600);
  });
});

describe('findNextBookmark', () => {
  test('with 1 video, 1 bookmark', () => {
    const bookmark = {
      ...baseVideoBookmark,
    };

    const video: Video = {
      ...baseVideo,
      bookmarks: [bookmark],
    };

    expect(findNextBookmark([video], bookmark)).toBe(undefined);
  });

  test('with 2 videos, 2 bookmarks each', () => {
    const video1 = {
      ...baseVideo,
      id: '1',
    };

    const video2 = {
      ...baseVideo,
      id: '2',
    };

    const bookmark1 = {
      ...baseVideoBookmark,
      time: 1,
      video_id: video1.id,
    };

    const bookmark2 = {
      ...baseVideoBookmark,
      time: 2,
      video_id: video2.id,
    };

    const bookmark3 = {
      ...baseVideoBookmark,
      time: 3,
      video_id: video1.id,
    };

    const bookmark4 = {
      ...baseVideoBookmark,
      time: 4,
      video_id: video2.id,
    };

    video1.bookmarks = [bookmark1, bookmark3];
    video2.bookmarks = [bookmark2, bookmark4];

    expect(findNextBookmark([video1, video2], bookmark1)).toStrictEqual([
      video2,
      bookmark2,
    ]);
    expect(findNextBookmark([video1, video2], bookmark2)).toStrictEqual([
      video1,
      bookmark3,
    ]);
    expect(findNextBookmark([video1, video2], bookmark3)).toStrictEqual([
      video2,
      bookmark4,
    ]);
    expect(findNextBookmark([video1, video2], bookmark4)).toBe(undefined);
  });
});

describe('findPreviousBookmark', () => {
  test('with 1 video, 1 bookmark', () => {
    const bookmark = {
      ...baseVideoBookmark,
    };

    const video: Video = {
      ...baseVideo,
      bookmarks: [bookmark],
    };

    expect(findPreviousBookmark([video], bookmark)).toBe(undefined);
  });

  test('with 2 videos, 2 bookmarks each', () => {
    const video1 = {
      ...baseVideo,
      id: '1',
    };

    const video2 = {
      ...baseVideo,
      id: '2',
    };

    const bookmark1 = {
      ...baseVideoBookmark,
      time: 1,
      video_id: video1.id,
    };

    const bookmark2 = {
      ...baseVideoBookmark,
      time: 2,
      video_id: video2.id,
    };

    const bookmark3 = {
      ...baseVideoBookmark,
      time: 3,
      video_id: video1.id,
    };

    const bookmark4 = {
      ...baseVideoBookmark,
      time: 4,
      video_id: video2.id,
    };

    video1.bookmarks = [bookmark1, bookmark3];
    video2.bookmarks = [bookmark2, bookmark4];

    expect(findPreviousBookmark([video1, video2], bookmark4)).toStrictEqual([
      video1,
      bookmark3,
    ]);
    expect(findPreviousBookmark([video1, video2], bookmark3)).toStrictEqual([
      video2,
      bookmark2,
    ]);
    expect(findPreviousBookmark([video1, video2], bookmark2)).toStrictEqual([
      video1,
      bookmark1,
    ]);
    expect(findPreviousBookmark([video1, video2], bookmark1)).toBe(undefined);
  });
});
