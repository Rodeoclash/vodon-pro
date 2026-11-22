import superjson from 'superjson';
import { describe, expect, test } from 'vitest';
import { buildVideo, buildVideoBookmark } from '../../../test/fixtures';
import type { Video } from '../models/Video';
import { deserialize, type Persisted, serialize } from './videosPersistence';

type TestState = {
  activeVideoId: string | null;
  videos: Video[];
  zoomPanEnabled: boolean;
};

const value = (videos: Video[]): Persisted<TestState> => ({
  version: 0,
  state: { activeVideoId: 'a', videos, zoomPanEnabled: true },
});

const existsOnly =
  (...paths: string[]) =>
  async (filePath: string) =>
    paths.includes(filePath);

describe('serialize', () => {
  test('drops each video element and keeps everything else', () => {
    const bookmark = buildVideoBookmark({ content: 'push B' });
    const video = buildVideo({
      id: 'a',
      syncTime: 12.5,
      bookmarks: [bookmark],
    });

    const stored = superjson.parse<Persisted<TestState>>(
      serialize(value([video])),
    );

    expect(stored.version).toBe(0);
    expect(stored.state.activeVideoId).toBe('a');
    expect(stored.state.videos[0].el).toBeNull();
    expect(stored.state.videos[0].syncTime).toBe(12.5);
    expect(stored.state.videos[0].bookmarks).toEqual([bookmark]);
  });

  test('keeps dates as dates', () => {
    const createdAt = new Date('2024-01-02T03:04:05Z');

    const stored = superjson.parse<Persisted<TestState>>(
      serialize(value([buildVideo({ createdAt })])),
    );

    expect(stored.state.videos[0].createdAt).toEqual(createdAt);
  });

  test('does not change the live state', () => {
    const video = buildVideo();
    const el = video.el;

    serialize(value([video]));

    expect(video.el).toBe(el);
  });
});

describe('deserialize', () => {
  test('gives each video a new element pointing at its file', async () => {
    const str = serialize(
      value([buildVideo({ id: 'a', filePath: '/vods/a.mp4' })]),
    );

    const restored = await deserialize<TestState>(str, {
      exists: existsOnly('/vods/a.mp4'),
    });

    const [video] = restored.state.videos;
    expect(video.el).toBeInstanceOf(HTMLVideoElement);
    expect(video.el.src).toContain('/vods/a.mp4');
  });

  test('skips videos whose files no longer exist', async () => {
    const str = serialize(
      value([
        buildVideo({ id: 'a', filePath: '/vods/a.mp4' }),
        buildVideo({ id: 'b', filePath: '/vods/gone.mp4' }),
        buildVideo({ id: 'c', filePath: '/vods/c.mp4' }),
      ]),
    );

    const restored = await deserialize<TestState>(str, {
      exists: existsOnly('/vods/a.mp4', '/vods/c.mp4'),
    });

    expect(restored.state.videos.map((video) => video.id)).toEqual(['a', 'c']);
  });

  test('turns pan and zoom off and keeps the rest of the state', async () => {
    const restored = await deserialize<TestState>(serialize(value([])), {
      exists: existsOnly(),
    });

    expect(restored.version).toBe(0);
    expect(restored.state.zoomPanEnabled).toBe(false);
    expect(restored.state.activeVideoId).toBe('a');
  });
});
