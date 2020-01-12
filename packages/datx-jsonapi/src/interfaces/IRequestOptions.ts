import { IFilters } from './IFilters';
import { IHeaders } from './IHeaders';

export interface IRequestOptions {
  queryParams?: {
    include?: string | Array<string>;
    filter?: IFilters;
    sort?: string | Array<string>;
    fields?: Record<string, string | Array<string>>;
    custom?: Array<{ key: string; value: string } | string>;
  };
  cacheOptions?: {
    skipCache?: boolean;
  };
  networkConfig?: {
    headers?: IHeaders;
  };
}
