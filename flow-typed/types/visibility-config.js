/**
 * @typedef {Object} VisibilityConfigObject
 * @param {FloatingConfigObject=} floating - The minimum player visible area percentage to consider as visible
 * @description Visibility plugin configuration parameters are provided whenever a player instance is created.
 * @example var config = {
 * plugins: {
 *   visibility: {
 *     // Visibility configuration here
 *     floating: {
 *       draggable: false
 *     }
 *   }
 * }
 * };
 * var player = KalturaPlayer.setup(config);
 */
declare type VisibilityConfigObject = {
  floating?: FloatingConfigObject
};
/**
 * @typedef {Object} FloatingConfigObject
 * @description When a viewer scrolls the player out of view, a floating player would pop-up and position itself following the configuration. This allows the viewer to engage with both the video content and the site content.
 * @param {('bottom-left'| 'bottom-right'| 'top-left' | 'top-right')} [position='bottom-right'] - The position where the floating player will be displayed
 * @param {boolean} [dismissible=true] - When set to true, viewer will be able to dismiss the floating player so that it doesn’t appear anymore while he scrolls the current page
 * @param {boolean} [draggable=true] - When set to true, viewer will be able to drag the floating player. Uncheck if you want to have a fixed location for the floating player
 * @param {number} [height=225] - The height of the floating player in pixels
 * @param {number} [width=400] - The width of the floating player in pixels
 * @param {number} [marginX=20] - The margin, in pixels, from the selected edge, on the X-Axis
 * @param {number} [marginY=20] - The margin, in pixels, from the selected edge, on the Y-Axis
 */

declare type FloatingConfigObject = {
  position: string
};
