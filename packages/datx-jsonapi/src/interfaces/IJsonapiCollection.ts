import {PureCollection, PureModel} from 'datx';

import {IResponse} from './JsonApi';

export interface IJsonapiCollection extends PureCollection {
  sync(body?: IResponse): PureModel|Array<PureModel>|null;
}
