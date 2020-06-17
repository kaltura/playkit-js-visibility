// @flow
import {registerPlugin} from '@playkit-js/playkit-js';
import {Visibility} from './visibility';

declare var __VERSION__: string;
declare var __NAME__: string;

export {Visibility as Plugin};
export {__VERSION__ as VERSION, __NAME__ as NAME};

const pluginName: string = 'visibility';
registerPlugin(pluginName, Visibility);
