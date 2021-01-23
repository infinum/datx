import { PureModel } from '@datx/core';

import { decorateModel } from './decorateModel';

export const DecoratedModel = decorateModel(PureModel);

export class GenericModel extends DecoratedModel {}
