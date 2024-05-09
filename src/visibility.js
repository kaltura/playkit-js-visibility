// @flow
import {core, BasePlugin, ui} from '@playkit-js/kaltura-player-js';
const {Utils} = core;
import './style.css';
import {DismissibleFloatingButtonComponent} from './components/dismissible/dismissible';
import {EventType} from './event-type';

const {redux, reducers} = ui;
const {actions} = reducers.shell;

const DRAG_THROTTLE_MS: number = 30;
const FLOATING_DRAGGABLE_CLASS: string = 'playkit-floating-draggable';
const FLOATING_ACTIVE_CLASS: string = 'playkit-floating-active';
const FLOATING_CONTAINER_CLASS: string = 'playkit-floating-container';
const FLOATING_POSTER_CLASS: string = 'playkit-floating-poster';
const FLOATING_POSTER_CLASS_SHOW: string = 'playkit-floating-poster-show';
const FLOATING_DISMISSIBLE_CONTAINER_ID: string = 'playkit-floating-dismissible-container';
const DISMISSIBLE_CONTAINER_HEIGHT: number = 32;
const DEFAULT_FLOATING_CONFIG: FloatingConfigObject = {
  position: 'bottom-right',
  height: '225',
  width: '400',
  marginX: '20',
  marginY: '20',
  dismissible: true,
  draggable: true
};

/**
 * Visibility class.
 * @classdesc
 * @ignore
 */
class Visibility extends BasePlugin {
  _appTargetContainer: HTMLElement | null;
  _floatingContainer: HTMLElement | null;
  _floatingPoster: HTMLElement | null;
  _playbackStartOccurred: boolean = false;
  _dismissed: boolean = false;
  _isInPIP: boolean = false;
  _currMousePos: {x: number, y: number} = {x: 0, y: 0};
  _throttleWait: boolean = false;
  _store: any;
  _playerSizeBeforeFloating: string;

  /**
   * The default configuration of the plugin.
   * @type {VisibilityConfigObject}
   * @static
   */
  static defaultConfig: FloatingConfigObject = {};

  getUIComponents() {
    return this.config.dismissible
      ? [
          {
            label: 'dismissibleFloatingButtonComponent',
            presets: ['Playback', 'Live', 'Error', 'Ads', 'Idle', 'Img'],
            container: 'TopBarRightControls',
            get: DismissibleFloatingButtonComponent,
            props: {
              onClose: (shouldScrollToPlayer = false) => {
                this._handleDismissFloating(shouldScrollToPlayer);
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
    this._store = redux.useStore();

    this._initFloating();

    this._addBindings();
  }

  get _state(): any {
    return this._store.getState();
  }

  _initFloating() {
    this.config = Utils.Object.mergeDeep(DEFAULT_FLOATING_CONFIG, this.config);
    this._floatingPoster = Utils.Dom.createElement('div');
    this._floatingPoster.className = FLOATING_POSTER_CLASS;
    this._floatingContainer = Utils.Dom.createElement('div');
    this._floatingContainer.className = FLOATING_CONTAINER_CLASS;

    Utils.Dom.prependTo(this._floatingPoster, this._appTargetContainer);
    const kalturaPlayerContainer = Utils.Dom.getElementById(this.player.config.ui.targetId);
    if (this._appTargetContainer && this._floatingContainer) {
      this._appTargetContainer.replaceChild(this._floatingContainer, kalturaPlayerContainer);
      Utils.Dom.appendChild(this._floatingContainer, kalturaPlayerContainer);

      this.config.position.split('-').forEach(side => {
        Utils.Dom.addClassName(this._floatingContainer, `${FLOATING_ACTIVE_CLASS}-${side}`);
      });
    }
    if (this.config.draggable) {
      Utils.Dom.addClassName(this._floatingContainer, FLOATING_DRAGGABLE_CLASS);
    }
  }

  _getDismissibleContainerEl(): HTMLElement {
    return Utils.Dom.getElementById(FLOATING_DISMISSIBLE_CONTAINER_ID);
  }

  _getFloatingContainerHeight(): string {
    return this.config.dismissible && this._getDismissibleContainerEl()
      ? `${Number(this.config.height) + DISMISSIBLE_CONTAINER_HEIGHT}`
      : this.config.height;
  }

  _handleDismissFloating(shouldScrollToPlayer: boolean) {
    this._dismissed = true;
    this.player.pause();
    if (shouldScrollToPlayer) {
      this._floatingPoster.scrollIntoView();
    }
    this._stopFloating();
    this.dispatchEvent(EventType.FLOATING_PLAYER_DISMISSED);
  }

  _stopFloating() {
    Utils.Dom.removeClassName(this._floatingPoster, FLOATING_POSTER_CLASS_SHOW);
    Utils.Dom.removeClassName(this._floatingContainer, FLOATING_ACTIVE_CLASS);
    Utils.Dom.removeAttribute(this._floatingContainer, 'style');
    if (this.config.draggable) {
      this.eventManager.unlisten(this._floatingContainer, 'mousedown');
      this.eventManager.unlisten(this._floatingContainer, 'touchstart');
      this._stopDrag();
    }
    this.dispatchEvent(EventType.FLOATING_PLAYER_STATE_CHANGED, {active: false});
    const playerSizeAfterFloating = this._state.shell.playerSize;
    if (this._playerSizeBeforeFloating !== playerSizeAfterFloating) {
      this._store.dispatch(actions.updatePlayerClientRect(this._floatingContainer.getBoundingClientRect()));
    }
  }

  _startFloating() {
    this._playerSizeBeforeFloating = this._state.shell.playerSize;
    Utils.Dom.addClassName(this._floatingContainer, FLOATING_ACTIVE_CLASS);
    Utils.Dom.addClassName(this._floatingPoster, FLOATING_POSTER_CLASS_SHOW);
    Utils.Dom.setStyle(this._floatingContainer, 'height', `${this._getFloatingContainerHeight()}px`);
    Utils.Dom.setStyle(this._floatingContainer, 'width', this.config.width + 'px');
    Utils.Dom.setStyle(this._floatingContainer, 'margin', `${this.config.marginY}px ${this.config.marginX}px`);
    if (this.config.dismissible) {
      const dismissibleContainerEl = this._getDismissibleContainerEl();
      if (dismissibleContainerEl) {
        this._floatingContainer.prepend(dismissibleContainerEl);
      }
    }
    if (this.config.draggable) {
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

  _handleFloatingChange(playerIsVisible: boolean) {
    if (playerIsVisible) {
      this._stopFloating();
    } else {
      this._startFloating();
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
    this.player.viewabilityManager.observe(this._appTargetContainer, this._handleViewabilityChanged.bind(this));
    this.eventManager.listen(this.player, this.player.Event.PLAYBACK_START, () => {
      this._playbackStartOccurred = true;
      Utils.Dom.setStyle(this._floatingPoster, 'background-image', `url("${this.player.config.sources.poster}")`);
    });
    this.eventManager.listen(this.player, this.player.Event.ENTER_FULLSCREEN, () => {
      let kalturaPlayerContainer = Utils.Dom.getElementById(this.player.config.ui.targetId);
      let dismissibleButton = kalturaPlayerContainer.querySelector('.playkit-floating-dismissible');
      Utils.Dom.addClassName(dismissibleButton, 'playkit-floating-infullscreen');
    });
    this.eventManager.listen(this.player, this.player.Event.EXIT_FULLSCREEN, () => {
      let kalturaPlayerContainer = Utils.Dom.getElementById(this.player.config.ui.targetId);
      let dismissibleButton = kalturaPlayerContainer.querySelector('.playkit-floating-dismissible');
      Utils.Dom.removeClassName(dismissibleButton, 'playkit-floating-infullscreen');
    });
  }

  _handleViewabilityChanged(visible: boolean, type: string) {
    if (type === this.player.ViewabilityType.VIEWPORT && this._playbackStartOccurred && !this._dismissed && !this._isInPIP) {
      this._handleFloatingChange(visible);
    }
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
    this.player.viewabilityManager.unObserve(this._appTargetContainer, this._handleViewabilityChanged.bind(this));
    this._appTargetContainer = null;
    this._floatingContainer = null;
    this._floatingPoster = null;
    this.eventManager.destroy();
    this._playerSizeBeforeFloating = '';
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
      let top = Math.max(boundClientRect.top - parseInt(floatingContainer.style.marginTop) - deltaMousePosY, 0); // bound top
      top = Math.min(top, window.innerHeight - boundClientRect.height - this.config.marginY * 2); //bound bottom
      floatingContainer.style.top = top + 'px';
      let left = Math.max(boundClientRect.left - parseInt(floatingContainer.style.marginLeft) - deltaMousePosX, 0); //bound left
      left = Math.min(left, window.innerWidth - boundClientRect.width - this.config.marginX * 2); //bound right
      floatingContainer.style.left = left + 'px';
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
