import {withActions} from './mixins/withActions';
import {withMeta} from './mixins/withMeta';
import {PureModel} from './PureModel';

export const Model = withActions(withMeta(PureModel));
