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

class DismissibleFloatingButtonComponent extends Component {
  render(props: any) {
    return (
      <div id={'playkit-floating-dismissible-container'}>
        <div className={'playkit-dismissible-text'}>Back to player</div>
        <Localizer>
          <a
            role="button"
            ref={el => {
              if (props.addAccessibleChild) {
                props.addAccessibleChild(el);
              }
            }}
            tabIndex="0"
            onClick={() => props.onClose()}
            onKeyDown={e => {
              if (e.keyCode === KeyMap.ENTER) {
                props.onClose();
              }
            }}
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
