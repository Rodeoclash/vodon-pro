// @vitest-environment node
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { createLastFolder } from './lastFolder';

describe('createLastFolder', () => {
  const documents = path.join('/home', 'coach', 'Documents');

  test('starts at the initial folder', () => {
    expect(createLastFolder(documents).get()).toBe(documents);
  });

  test('moves to the folder of the last file used', () => {
    const lastFolder = createLastFolder(documents);
    lastFolder.rememberFile(path.join('/data', 'scrims', 'week1.json'));
    expect(lastFolder.get()).toBe(path.join('/data', 'scrims'));
  });

  test('keeps separate state per instance', () => {
    const a = createLastFolder(documents);
    const b = createLastFolder(documents);
    a.rememberFile(path.join('/elsewhere', 'p.json'));
    expect(b.get()).toBe(documents);
  });
});
