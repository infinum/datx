import {IModelConstructor, PureModel} from 'datx';

import {decorateModel} from './decorateModel';
import {IJsonapiModel} from './interfaces/IJsonapiModel';

export const DecoratedModel = decorateModel(PureModel) as IModelConstructor<PureModel & IJsonapiModel>;

export class GenericModel extends DecoratedModel {}
