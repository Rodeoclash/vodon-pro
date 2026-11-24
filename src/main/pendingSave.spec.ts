// @vitest-environment node
import { describe, expect, test } from 'vitest';
import { createPendingSave } from './pendingSave';

describe('createPendingSave', () => {
  test('has nothing to save to until a path is chosen', () => {
    expect(createPendingSave().take()).toBeNull();
  });

  test('gives the chosen path once', () => {
    const pending = createPendingSave();
    pending.expect('/projects/scrim.json');
    expect(pending.take()).toBe('/projects/scrim.json');
    expect(pending.take()).toBeNull();
  });

  test('uses the most recently chosen path', () => {
    const pending = createPendingSave();
    pending.expect('/projects/old.json');
    pending.expect('/projects/new.json');
    expect(pending.take()).toBe('/projects/new.json');
  });
});
