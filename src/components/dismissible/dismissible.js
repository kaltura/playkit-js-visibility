// @flow
/** @jsx h */
import {h, preact, preacti18n, utils, Components} from 'playkit-js-ui';
const Localizer = preacti18n.Localizer;
const Text = preacti18n.Text;
const Component = preact.Component;
const KeyMap = utils.KeyMap;
const Icon = Components.Icon;
const IconType = Components.IconType;

class DismissibleFloatingButtonComponent extends Component {
  render(props) {
    return (
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
    );
  }
}

export {DismissibleFloatingButtonComponent};
