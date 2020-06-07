// @flow
import {BasePlugin, Utils} from 'playkit-js';
import {VisibilityType} from './visibility-type';
import './style.css';
import {DismissibleFloatingButtonComponent} from './components/dismissible/dismissible';
/**
 * The video tag class.
 * @type {string}
 * @const
 */
const FLOATING_ACTIVE_CLASS: string = 'playkit-floating-active';
const FLOATING_CONTAINER_CLASS: string = 'playkit-floating-container';
const FLOATING_POSTER_CLASS: string = 'playkit-floating-poster';

/**
 * Visibility class.
 * @classdesc
 */
class Visibility extends BasePlugin {
  appTargetContainer: HTMLElement;
  floatingContainer: HTMLElement;
  floatingPoster: HTMLElement;
  observer: IntersectionObserver;

  /**
   * The default configuration of the plugin.
   * @type {Object}
   * @static
   */
  static defaultConfig: Object = {
    floating: {
      position: 'bottom-right',
      size: {
        height: '225px',
        width: '400px'
      }
    }
  };

  getUIComponents() {
    return [
      {
        label: 'dismissibleFloatingButtonComponent',
        presets: ['Playback', 'Live'],
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
    this.appTargetContainer = document.getElementById(player.config.targetId);
    this.reset();
    if (this.config.type === VisibilityType.FLOATING) {
      this._initFloating();
    }
  }

  _initFloating() {
    this.floatingPoster = document.createElement('div');
    this.floatingPoster.className = FLOATING_POSTER_CLASS;
    this.floatingContainer = document.createElement('div');
    this.floatingContainer.className = FLOATING_CONTAINER_CLASS;
    this.floatingContainer.innerHTML = this.appTargetContainer.innerHTML;
    this.appTargetContainer.innerHTML = '';
    this.appTargetContainer.appendChild(this.floatingPoster);
    this.appTargetContainer.appendChild(this.floatingContainer);

    this.config.floating.position.split('-').forEach(side => {
      Utils.Dom.addClassName(this.floatingContainer, `${FLOATING_ACTIVE_CLASS}-${side}`);
    });
  }

  _dismissed() {
    this.player.pause();
    this._stopFloating();
    this.observer.disconnect();
  }

  _startFloatingObserver() {
    let options = {
      threshold: 0.5
    };

    this.observer = new IntersectionObserver(this._handleFloatingVisibilityChange.bind(this), options);
    this.observer.observe(this.appTargetContainer);
    Utils.Dom.setStyle(this.floatingPoster, 'background-image', `url("${this.player.config.sources.poster}")`);
  }

  _stopFloating() {
    Utils.Dom.removeClassName(this.floatingContainer, FLOATING_ACTIVE_CLASS);
    Utils.Dom.removeAttribute(this.floatingContainer, 'style');
  }

  _startFloating() {
    Utils.Dom.addClassName(this.floatingContainer, FLOATING_ACTIVE_CLASS);
    Utils.Dom.setStyle(this.floatingContainer, 'height', this.config.floating.size.height);
    Utils.Dom.setStyle(this.floatingContainer, 'width', this.config.floating.size.width);
  }

  _handleFloatingVisibilityChange(entries) {
    for (let entry: IntersectionObserverEntry of entries) {
      if (entry.intersectionRatio < 0.5) {
        this._startFloating();
      } else {
        this._stopFloating();
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
