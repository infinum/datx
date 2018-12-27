import {PureModel} from 'datx';

import {decorateModel} from './decorateModel';

export const DecoratedModel = decorateModel(PureModel);

export class GenericModel extends DecoratedModel {}
