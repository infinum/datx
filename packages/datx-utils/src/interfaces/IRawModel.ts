import {IDictionary} from './IDictionary';

export interface IRawModel extends IDictionary<any> {
  __META__?: IDictionary<any>;
}
