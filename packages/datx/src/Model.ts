import {withActions} from './mixins/withActions';
import {withMeta} from './mixins/withMeta';
import {PureModel} from './PureModel';

// const Model = withActions(withMeta(PureModel));
@withActions
@withMeta
class Model extends PureModel {}

export {Model};
