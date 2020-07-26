// @flow
import {BasePlugin, Utils} from '@playkit-js/playkit-js';
import './style.css';
import {DismissibleFloatingButtonComponent} from './components/dismissible/dismissible';
import 'intersection-observer';
import {EventType} from './event-type';

const DRAG_THROTTLE_MS: number = 30;
const FLOATING_DRAGGABLE_CLASS: string = 'playkit-floating-draggable';
const FLOATING_ACTIVE_CLASS: string = 'playkit-floating-active';
const FLOATING_CONTAINER_CLASS: string = 'playkit-floating-container';
const FLOATING_POSTER_CLASS: string = 'playkit-floating-poster';
const DEFUALT_FLOATING_CONFIG = {
  floating: {
    position: 'bottom-right',
    height: '225',
    width: '400',
    marginX: '20',
    marginY: '20',
    dismissible: true,
    draggable: true
  }
};

/**
 * Visibility class.
 * @classdesc
 */
class Visibility extends BasePlugin {
  _appTargetContainer: HTMLElement | null;
  _floatingContainer: HTMLElement | null;
  _floatingPoster: HTMLElement | null;
  _observer: window.IntersectionObserver;
  _playbackStartOccurred: boolean = false;
  _dismissed: boolean = false;
  _isInPIP: boolean = false;
  _currMousePos: {x: number, y: number} = {x: 0, y: 0};
  _throttleWait: boolean = false;

  /**
   * The default configuration of the plugin.
   * @type {Object}
   * @static
   */
  static defaultConfig: Object = {
    threshold: 50
  };

  getUIComponents() {
    return this.config.floating && this.config.floating.dismissible
      ? [
          {
            label: 'dismissibleFloatingButtonComponent',
            presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle'],
            container: 'TopBarRightControls',
            get: DismissibleFloatingButtonComponent,
            props: {
              onClose: () => {
                this._handleDismissFloating();
              }
            }
          }
        ]
      : [];
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
    this._appTargetContainer = Utils.Dom.getElementById(this.player.config.targetId);

    if (this.config.floating) {
      this._initFloating();
    }

    this._addBindings();
    const options = {
      threshold: this.config.threshold / 100
    };

    this._observer = new window.IntersectionObserver(this._handleVisibilityChange.bind(this), options);
    this._observer.observe(this._appTargetContainer);
  }

  _initFloating() {
    this.config = Utils.Object.mergeDeep(DEFUALT_FLOATING_CONFIG, this.config);
    this._floatingPoster = Utils.Dom.createElement('div');
    this._floatingPoster.className = FLOATING_POSTER_CLASS;
    this._floatingContainer = Utils.Dom.createElement('div');
    this._floatingContainer.className = FLOATING_CONTAINER_CLASS;

    Utils.Dom.prependTo(this._floatingPoster, this._appTargetContainer);
    let kalturaPlayerContainer = Utils.Dom.getElementById(this.player.config.ui.targetId);
    if (this._appTargetContainer && this._floatingContainer) {
      this._appTargetContainer.replaceChild(this._floatingContainer, kalturaPlayerContainer);
      Utils.Dom.appendChild(this._floatingContainer, kalturaPlayerContainer);

      this.config.floating.position.split('-').forEach(side => {
        Utils.Dom.addClassName(this._floatingContainer, `${FLOATING_ACTIVE_CLASS}-${side}`);
      });
    }
    if (this.config.floating.draggable) {
      Utils.Dom.addClassName(this._floatingContainer, FLOATING_DRAGGABLE_CLASS);
    }
  }

  _handleDismissFloating() {
    this._dismissed = true;
    this.player.pause();
    this._stopFloating();
    this.dispatchEvent(EventType.FLOATING_PLAYER_DISMISSED);
  }

  _stopFloating() {
    Utils.Dom.removeClassName(this._floatingContainer, FLOATING_ACTIVE_CLASS);
    Utils.Dom.removeAttribute(this._floatingContainer, 'style');
    if (this.config.floating.draggable) {
      this.eventManager.unlisten(this._floatingContainer, 'mousedown');
      this.eventManager.unlisten(this._floatingContainer, 'touchstart');
      this._stopDrag();
    }
    this.dispatchEvent(EventType.FLOATING_PLAYER_STATE_CHANGED, {active: false});
  }

  _startFloating() {
    Utils.Dom.addClassName(this._floatingContainer, FLOATING_ACTIVE_CLASS);
    Utils.Dom.setStyle(this._floatingContainer, 'height', this.config.floating.height + 'px');
    Utils.Dom.setStyle(this._floatingContainer, 'width', this.config.floating.width + 'px');
    Utils.Dom.setStyle(this._floatingContainer, 'margin', `${this.config.floating.marginY}px ${this.config.floating.marginX}px`);
    if (this.config.floating.draggable) {
      this.eventManager.listen(this._floatingContainer, 'mousedown', e => {
        this._startDrag(e, 'mousemove', 'mouseup');
      });
      this.eventManager.listen(this._floatingContainer, 'touchstart', e => {
        this.eventManager.unlisten(this._floatingContainer, 'mousedown');
        this._startDrag(e, 'touchmove', 'touchend');
      });
    }
    this.dispatchEvent(EventType.FLOATING_PLAYER_STATE_CHANGED, {active: true});
  }

  _handleVisibilityChange(entries: Array<window.IntersectionObserverEntry>) {
    const playerIsOutOfVisibility = entries[0].intersectionRatio < this.config.threshold / 100;
    if (this.config.floating && this._playbackStartOccurred && !this._dismissed && !this._isInPIP) {
      this._handleFloatingChange(playerIsOutOfVisibility);
    }
    this.dispatchEvent(EventType.PLAYER_VISIBILITY_CHANGED, {visible: !playerIsOutOfVisibility});
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
    this.eventManager.listen(this.player, this.player.Event.ENTER_PICTURE_IN_PICTURE, () => {
      this._stopFloating();
      this._isInPIP = true;
    });
    this.eventManager.listen(this.player, this.player.Event.LEAVE_PICTURE_IN_PICTURE, () => {
      this._isInPIP = false;
    });
    this.eventManager.listen(this.player, this.player.Event.PLAYBACK_START, () => {
      this._playbackStartOccurred = true;
      Utils.Dom.setStyle(this._floatingPoster, 'background-image', `url("${this.player.config.sources.poster}")`);
    });
  }

  /**
   * Destroys the plugin.
   * @override
   * @public
   * @returns {void}
   */
  destroy(): void {
    this.logger.debug('destroy');
    Utils.Dom.removeChild(this._appTargetContainer, this._floatingContainer);
    Utils.Dom.removeChild(this._appTargetContainer, this._floatingPoster);
    this._appTargetContainer = null;
    this._floatingContainer = null;
    this._floatingPoster = null;
    this._observer.disconnect();
    this._observer = null;
    this.eventManager.destroy();
  }

  _startDrag(e: MouseEvent | TouchEvent, moveEventName: string, endEventName: string) {
    this.eventManager.listenOnce(document, endEventName, () => {
      this._stopDrag();
    });

    // get the mouse cursor position at startup:
    this._currMousePos.x = this._clientX(e);
    this._currMousePos.y = this._clientY(e);

    this.eventManager.listen(document, moveEventName, e => {
      this._moveDrag(e);
    });
  }

  _clientX(e: MouseEvent | TouchEvent): number {
    if (e instanceof MouseEvent) {
      return e.clientX;
    }
    return e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientX;
  }

  _clientY(e: MouseEvent | TouchEvent): number {
    if (e instanceof MouseEvent) {
      return e.clientY;
    }
    return e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientY;
  }

  _moveDrag(e: MouseEvent | TouchEvent) {
    if (this._throttleWait) return;

    e = e || window.event;
    // calculate the new cursor position:
    const deltaMousePosX = this._currMousePos.x - this._clientX(e);
    const deltaMousePosY = this._currMousePos.y - this._clientY(e);
    this._currMousePos.x = this._clientX(e);
    this._currMousePos.y = this._clientY(e);
    const floatingContainer = this._floatingContainer; // flow
    // set the element's new position
    if (floatingContainer) {
      const boundClientRect = floatingContainer.getBoundingClientRect();
      floatingContainer.style.top = boundClientRect.top - parseInt(floatingContainer.style.marginTop) - deltaMousePosY + 'px';
      floatingContainer.style.left = boundClientRect.left - parseInt(floatingContainer.style.marginLeft) - deltaMousePosX + 'px';
    }

    // handle throttling to avoid performance issues on dragging
    this._throttleWait = true;
    setTimeout(() => {
      this._throttleWait = false;
    }, DRAG_THROTTLE_MS);
  }

  _stopDrag() {
    // stop moving when mouse button is released:
    this.eventManager.unlisten(document, 'mousemove');
    this.eventManager.unlisten(document, 'touchmove');
  }
}

export {Visibility};
