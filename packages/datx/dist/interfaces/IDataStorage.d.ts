import { IDictionary } from './IDictionary';
export interface IDataStorage {
    data: IDictionary<any>;
    meta: IDictionary<any>;
}
