import { IHeaders } from './IHeaders';
import { CachingStrategy } from '../enums/CachingStrategy';

export interface IRequestOptions {
  query?: Record<string, string | Array<string> | Record<string, unknown>>;
  cacheOptions?: {
    cachingStrategy?: CachingStrategy;
    maxAge?: number;
    skipCache?: boolean;
  };
  networkConfig?: {
    headers?: IHeaders;
  };
}
