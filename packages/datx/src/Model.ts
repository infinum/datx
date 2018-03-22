import {IActionsMixin} from './interfaces/IActionsMixin';
import {IMetaMixin} from './interfaces/IMetaMixin';
import {IModelConstructor} from './interfaces/IModelConstructor';
import {withActions} from './mixins/withActions';
import {withMeta} from './mixins/withMeta';
import {PureModel} from './PureModel';

export class Model extends withActions(withMeta(PureModel)) {}
