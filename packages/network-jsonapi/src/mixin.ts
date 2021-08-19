import { mixinBuilder } from '@datx/core';

import { decorateCollection } from './decorateCollection';
import { decorateModel } from './decorateModel';
import { decorateView } from './decorateView';

export const jsonapi = mixinBuilder(decorateModel, decorateCollection, decorateView);
