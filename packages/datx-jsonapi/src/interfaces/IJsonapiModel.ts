import {PureModel} from 'datx';

import {IRequestOptions} from './IRequestOptions';

export interface IJsonapiModel extends PureModel {
  save(options?: IRequestOptions): Promise<IJsonapiModel>;

  destroy(options?: IRequestOptions): Promise<void>;
}
