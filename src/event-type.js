// @flow
const EventType: EventTypes = {
  /**
   * Fired when the player got in or out of visibility (according to the minimum visible percentage threshold)
   */
  PLAYER_VISIBILITY_CHANGED: 'playervisibilitychanged',
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
