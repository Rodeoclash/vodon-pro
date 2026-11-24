/**
 * Where the next project save goes. The user picks the file in a save
 * dialog in the main process; the renderer only supplies the contents, so
 * it can never choose (or reuse) a path to write to.
 */
export function createPendingSave() {
  let pendingPath: string | null = null;

  return {
    /** The user chose where to save; expect one save to it. */
    expect: (filePath: string): void => {
      pendingPath = filePath;
    },
    /** The path for this save, once. Null if no save was asked for. */
    take: (): string | null => {
      const filePath = pendingPath;
      pendingPath = null;
      return filePath;
    },
  };
}

export type PendingSave = ReturnType<typeof createPendingSave>;
