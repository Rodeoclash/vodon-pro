export type CurrentTimeChange = {
  source:
    | 'CURRENT_TIME_CHANGE_SOURCE_CLOCK'
    | 'CURRENT_TIME_CHANGE_SOURCE_SEEK'
    | 'CURRENT_TIME_CHANGE_SOURCE_FRAME_NUDGE';
  time: number;
};

/**
 * Fired when the global time needs to change, will pass a source so that
 * listening elements can determine if they respond to it or not.
 */
export const CURRENT_TIME_CHANGE = 'CURRENT_TIME_CHANGE';
export const CURRENT_TIME_CHANGE_SOURCE_CLOCK =
  'CURRENT_TIME_CHANGE_SOURCE_CLOCK';
export const CURRENT_TIME_CHANGE_SOURCE_SEEK =
  'CURRENT_TIME_CHANGE_SOURCE_SEEK';
export const CURRENT_TIME_CHANGE_SOURCE_FRAME_NUDGE =
  'CURRENT_TIME_CHANGE_SOURCE_FRAME_NUDGE';
