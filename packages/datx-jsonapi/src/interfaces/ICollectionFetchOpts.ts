import {View} from 'datx';

import {IHeaders} from './IHeaders';
import {IJsonapiCollection} from './IJsonapiCollection';
import {IRequestOptions} from './IRequestOptions';

export interface ICollectionFetchOpts {
  url: string;
  options?: IRequestOptions & { headers?: IHeaders };
  data?: object;
  method: string;
  collection?: IJsonapiCollection;
  skipCache?: boolean;
  views?: Array<View>;
}
