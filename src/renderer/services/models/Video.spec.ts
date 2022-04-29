import { findMaxNormalisedDuration } from './Video';
import type { Video } from './Video';

// TODO: This might need to be moved to a fixtures or similar
const baseVideo = {
  bookmarks: [],
  codedHeight: 1080,
  codedWidth: 1920,
  createdAt: new Date('04 Dec 1995 00:12:00 GMT'),
  displayAspectRatio: '16/9',
  duration: null,
  durationNormalised: null,
  el: null,
  filePath: 'c:\\video.mp4',
  frameRate: 60,
  id: '1',
  name: 'A Video',
  offset: null,
  syncTime: 0,
  volume: 1,
};

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
