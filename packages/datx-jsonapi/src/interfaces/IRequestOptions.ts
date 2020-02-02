import { IFilters } from './IFilters';
import { IHeaders } from './IHeaders';
import { CachingStrategy } from '../enums/CachingStrategy';

export interface IRequestOptions {
  queryParams?: {
    include?: string | Array<string>;
    filter?: IFilters;
    sort?: string | Array<string>;
    fields?: Record<string, string | Array<string>>;
    custom?: Array<{ key: string; value: string } | string>;
  };
  cacheOptions?: {
    cachingStrategy?: CachingStrategy;
    maxAge?: number;
    skipCache?: boolean;
  };
  networkConfig?: {
    headers?: IHeaders;
  };
}
