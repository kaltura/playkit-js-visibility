// @flow
/**
 * @jsx h
 * @ignore
 */
import {ui} from '@playkit-js/kaltura-player-js';

const {h, preact, preacti18n, utils, Components} = ui;
const {Localizer, Text} = preacti18n;
const {Component} = preact;
const {KeyMap} = utils;
const {Icon, IconType} = Components;

type DismissibleProps = {
  onClose: (shouldScrollToPlayer: boolean) => void
};

class DismissibleFloatingButtonComponent extends Component<DismissibleProps> {
  _onKeyDownHandler(e: KeyboardEvent, shouldScrollToPlayer = false): void {
    if (e.keyCode === KeyMap.ENTER) {
      this.props.onClose(shouldScrollToPlayer);
    }
  }

  render(props: any) {
    const sharedProps = {
      role: 'button',
      tabIndex: '0',
      ref: el => {
        if (props.addAccessibleChild) {
          props.addAccessibleChild(el);
        }
      }
    };

    return (
      <div id={'playkit-floating-dismissible-container'}>
        <Localizer>
          <div
            {...sharedProps}
            className={'playkit-dismissible-text'}
            onClick={() => props.onClose(true)}
            onKeyDown={e => this._onKeyDownHandler(e, true)}
            aria-label={<Text id="floating.back_to_video">Back to video</Text>}>
            {<Text id="floating.back_to_video">Back to video</Text>}
          </div>
        </Localizer>
        <Localizer>
          <a
            {...sharedProps}
            onClick={() => props.onClose()}
            onKeyDown={e => this._onKeyDownHandler(e)}
            aria-label={<Text id="overlay.close" />}
            className={'playkit-floating-dismissible playkit-icon playkit-icon-close'}>
            <Icon type={IconType.Close} />
          </a>
        </Localizer>
      </div>
    );
  }
}

export {DismissibleFloatingButtonComponent};
