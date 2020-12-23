// @flow
/**
 * @typedef {Object} EventType
 */
const EventType: PKEventTypes = {
  /**
   * Fired when the player started / stopped floating due to visibility change
   */
  FLOATING_PLAYER_STATE_CHANGED: 'floatingplayerstatechanged',
  /**
   * Fired when the player stopped floating due to end user dismissal
   */
  FLOATING_PLAYER_DISMISSED: 'floatingplayerdismissed'
};

export {EventType};
