import {IDictionary, IRawModel} from 'datx-utils';

import {IRawView} from './IRawView';

export interface IRawCollection {
  models: Array<IRawModel>;
  views: IDictionary<IRawView>;
}
