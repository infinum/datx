import { IModelConstructor, PureModel } from 'datx';

import { decorateModel } from './decorateModel';
import { IJsonapiModel } from './interfaces/IJsonapiModel';

export const DecoratedModel = decorateModel(PureModel);

export class GenericModel extends DecoratedModel {}
