// @flow
import {BasePlugin, Utils} from 'playkit-js';
import './style.css';
import {DismissibleFloatingButtonComponent} from './components/dismissible/dismissible';
import 'intersection-observer';

const FLOATING_ACTIVE_CLASS: string = 'playkit-floating-active';
const FLOATING_CONTAINER_CLASS: string = 'playkit-floating-container';
const FLOATING_POSTER_CLASS: string = 'playkit-floating-poster';

/**
 * Visibility class.
 * @classdesc
 */
class Visibility extends BasePlugin {
  appTargetContainer: HTMLElement | null;
  floatingContainer: HTMLElement;
  floatingPoster: HTMLElement;
  observer: window.IntersectionObserver;
  everStartedPlaying: boolean = false;
  dismissed: boolean = false;

  /**
   * The default configuration of the plugin.
   * @type {Object}
   * @static
   */
  static defaultConfig: Object = {
    threshold: 0.5
  };

  getUIComponents() {
    return [
      {
        label: 'dismissibleFloatingButtonComponent',
        presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
        container: 'TopBarRightControls',
        get: DismissibleFloatingButtonComponent,
        props: {
          onClose: () => {
            this._dismissed();
          }
        }
      }
    ];
  }

  /**
   * @static
   * @public
   * @returns {boolean} - Whether the plugin is valid.
   */
  static isValid(): boolean {
    return true;
  }

  /**
   * @constructor
   * @param {string} name - The plugin name.
   * @param {Player} player - The player instance.
   * @param {Object} config - The plugin config.
   */
  constructor(name: string, player: Player, config: Object) {
    super(name, player, config);
    this.reset();
    if (this.config.floating) {
      this._initFloating();
    }
    const options = {
      threshold: this.config.threshold
    };

    this.observer = new window.IntersectionObserver(this._handleVisibilityChange.bind(this), options);
    this.observer.observe(this.appTargetContainer);
  }

  _initFloating() {
    const defaultFloatingConfig = {
      floating: {
        position: 'bottom-right',
        size: {
          height: '225px',
          width: '400px'
        },
        margin: {
          x: '2px',
          y: '2px'
        }
      }
    };
    Utils.Object.mergeDeep(this.config, defaultFloatingConfig, Utils.Object.copyDeep(this.config));
    this.floatingPoster = Utils.Dom.createElement('div');
    this.floatingPoster.className = FLOATING_POSTER_CLASS;
    this.floatingContainer = Utils.Dom.createElement('div');
    this.floatingContainer.className = FLOATING_CONTAINER_CLASS;

    this.appTargetContainer = Utils.Dom.getElementById(this.player.config.targetId);
    this.floatingContainer.innerHTML = this.appTargetContainer.innerHTML;
    this.appTargetContainer.innerHTML = '';
    Utils.Dom.appendChild(this.appTargetContainer, this.floatingPoster);
    Utils.Dom.appendChild(this.appTargetContainer, this.floatingContainer);
    this.config.floating.position.split('-').forEach(side => {
      Utils.Dom.addClassName(this.floatingContainer, `${FLOATING_ACTIVE_CLASS}-${side}`);
    });
  }

  _dismissed() {
    this.dismissed = true;
    this.player.pause();
    this._stopFloating();
  }

  _stopFloating() {
    Utils.Dom.removeClassName(this.floatingContainer, FLOATING_ACTIVE_CLASS);
    Utils.Dom.removeAttribute(this.floatingContainer, 'style');
  }

  _startFloating() {
    Utils.Dom.addClassName(this.floatingContainer, FLOATING_ACTIVE_CLASS);
    Utils.Dom.setStyle(this.floatingContainer, 'height', this.config.floating.size.height);
    Utils.Dom.setStyle(this.floatingContainer, 'width', this.config.floating.size.width);
    Utils.Dom.setStyle(this.floatingContainer, 'margin', `${this.config.floating.margin.y} ${this.config.floating.margin.x}`);
  }

  _handleVisibilityChange(entries: Array<window.IntersectionObserverEntry>) {
    const playerIsOutOfVisibility = entries[0].intersectionRatio < this.config.threshold;
    if (this.config.floating && this.everStartedPlaying && !this.dismissed) {
      this._handleFloatingChange(playerIsOutOfVisibility);
    }
  }

  _handleFloatingChange(playerIsOutOfVisibility: boolean) {
    if (playerIsOutOfVisibility) {
      this._startFloating();
    } else {
      this._stopFloating();
    }
  }
  /**
   * _addBindings
   * @private
   * @returns {void}
   */
  _addBindings(): void {
    this.eventManager.listen(this.player, this.player.Event.FIRST_PLAYING, () => {
      this.everStartedPlaying = true;
      Utils.Dom.setStyle(this.floatingPoster, 'background-image', `url("${this.player.config.sources.poster}")`);
    });
  }

  /**
   * Destroys the plugin.
   * @override
   * @public
   * @returns {void}
   */
  destroy(): void {
    this.observer.disconnect();
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
