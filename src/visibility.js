// @flow
import {BasePlugin, Utils} from 'playkit-js';
import {VisibilityType} from './visibility-type';
import './style.css';
/**
 * The video tag class.
 * @type {string}
 * @const
 */
const FLOATING_ACTIVE_CLASS: string = 'playkit-floating-active';
const FLOATING_CONTAINER_ID: string = 'playkit-floating-container';
const FLOATING_POSTER_ID: string = 'playkit-floating-poster';

/**
 * Visibility class.
 * @classdesc
 */
class Visibility extends BasePlugin {
  /**
   * The default configuration of the plugin.
   * @type {Object}
   * @static
   */
  static defaultConfig: Object = {};

  /**
   * @static
   * @public
   * @returns {boolean} - Whether the plugin is valid.
   */
  static isValid(): boolean {
    return true;
  }

  appTargetContainer: HTMLElement;
  floatingContainer: HTMLElement;
  floatingPoster: HTMLElement;
  observer: IntersectionObserver;

  /**
   * @constructor
   * @param {string} name - The plugin name.
   * @param {Player} player - The player instance.
   * @param {Object} config - The plugin config.
   */
  constructor(name: string, player: Player, config: Object) {
    super(name, player, config);
    this.appTargetContainer = document.getElementById(player.config.targetId);
    this.reset();
    this._initFloating();
  }

  _initFloating() {
    this.appTargetContainer.innerHTML = `<div id=${FLOATING_POSTER_ID}></div><div id=${FLOATING_CONTAINER_ID}>${
      this.appTargetContainer.innerHTML
    }</div>`;
    this.floatingContainer = document.getElementById(FLOATING_CONTAINER_ID);
    this.floatingPoster = document.getElementById(FLOATING_POSTER_ID);
  }

  _startFloatingObserver() {
    let options = {
      threshold: 0.5
    };

    this.observer = new IntersectionObserver(this._handleFloatingVisibilityChange.bind(this), options);
    this.observer.observe(this.appTargetContainer);
    Utils.Dom.setStyle(this.floatingPoster, 'background-image', `url("${this.player.config.sources.poster}")`);
  }

  _handleFloatingVisibilityChange(entries) {
    for (let entry: IntersectionObserverEntry of entries) {
      if (entry.intersectionRatio < 0.5) {
        Utils.Dom.addClassName(this.floatingContainer, FLOATING_ACTIVE_CLASS);
      } else {
        Utils.Dom.removeClassName(this.floatingContainer, FLOATING_ACTIVE_CLASS);
      }
      window.console.log(entry.isIntersecting, entry.intersectionRatio);
    }
  }

  /**
   * _addBindings
   * @private
   * @returns {void}
   */
  _addBindings(): void {
    this.eventManager.listen(this.player, this.player.Event.FIRST_PLAYING, () => {
      if (this.config.type === VisibilityType.FLOATING) {
        this._startFloatingObserver();
      }
    });
  }

  /**
   * Destroys the plugin.
   * @override
   * @public
   * @returns {void}
   */
  destroy(): void {
    this._clean();
  }

  /**
   * Resets the plugin.
   * @override
   * @public
   * @returns {void}
   */
  reset(): void {
    this.eventManager.removeAll();
    this._addBindings();
  }
}

export {Visibility};
