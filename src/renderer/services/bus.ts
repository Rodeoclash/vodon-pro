export type CurrentTimeChange = {
  time: number;
};

/**
 * Fired when the global time needs to change, will pass a source so that
 * listening elements can determine if they respond to it or not.
 */
export const GLOBAL_TIME_CHANGE = 'GLOBAL_TIME_CHANGE';
