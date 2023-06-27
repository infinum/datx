import { IFilters } from './IFilters';
import { IHeaders } from './IHeaders';
import { CachingStrategy } from '@datx/network';

export interface IRequestOptions {
  queryParams?: {
    include?: string | ReadonlyArray<string>;
    filter?: IFilters;
    sort?: string | ReadonlyArray<string>;
    fields?: Record<string, string | ReadonlyArray<string>>;
    custom?: ReadonlyArray<{ key: string; value: string } | string>;
  };
  cacheOptions?: {
    cachingStrategy?: CachingStrategy;
    maxAge?: number;
    skipCache?: boolean;
  };
  networkConfig?: {
    headers?: IHeaders;
  };

  /** If you don't know what this is for, you should probably not use it */
  fetchOptions?: object;
}
