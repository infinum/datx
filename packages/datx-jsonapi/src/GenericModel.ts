import {IModelConstructor, PureModel} from 'datx';

import {decorateModel} from './decorateModel';
import {IJsonapiModel} from './interfaces/IJsonapiModel';

export const GenericModel = decorateModel(PureModel) as IModelConstructor<PureModel & IJsonapiModel>;
