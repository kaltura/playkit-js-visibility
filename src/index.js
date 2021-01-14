// @flow
import {registerPlugin} from 'kaltura-player-js';
import {Visibility} from './visibility';

declare var __VERSION__: string;
declare var __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {Visibility as Plugin};
export {VERSION, NAME};
export {EventType} from './event-type';

const pluginName: string = 'floating';
registerPlugin(pluginName, Visibility);
