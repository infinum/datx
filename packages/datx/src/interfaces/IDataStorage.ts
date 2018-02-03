import {IDictionary} from 'datx-utils';

export interface IDataStorage {
  data: IDictionary<any>;
  meta: IDictionary<any>;
}
