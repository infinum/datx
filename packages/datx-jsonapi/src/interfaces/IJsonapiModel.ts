import { PureModel } from '@datx/core';

import { IRequestOptions } from './IRequestOptions';

export interface IJsonapiModel extends PureModel {
  save(options?: IRequestOptions): Promise<IJsonapiModel>;

  destroy(options?: IRequestOptions): Promise<void>;
}
