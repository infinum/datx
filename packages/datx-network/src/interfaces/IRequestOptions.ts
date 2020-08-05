import { IHeaders } from './IHeaders';
import { CachingStrategy } from '../enums/CachingStrategy';

export interface IRequestOptions {
  query?: Array<{ key: string; value: string } | string>;
  cacheOptions?: {
    cachingStrategy?: CachingStrategy;
    maxAge?: number;
    skipCache?: boolean;
  };
  networkConfig?: {
    headers?: IHeaders;
  };
}
