import {Collection, Model} from 'datx';

import {IResponse} from './JsonApi';

export interface IJsonapiCollection extends Collection {
  sync(body?: IResponse): Model|Array<Model>|null;
}
