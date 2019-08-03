import { View } from 'datx';

import { IJsonapiCollection } from './IJsonapiCollection';
import { IRequestOptions } from './IRequestOptions';

export interface ICollectionFetchOpts {
  url: string;
  options?: IRequestOptions;
  data?: object;
  method: string;
  collection?: IJsonapiCollection;
  skipCache?: boolean;
  views?: Array<View>;
}
