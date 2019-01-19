import { IDictionary } from 'datx-utils';

import { IFilters } from './IFilters';
import { IHeaders } from './IHeaders';

export interface IRequestOptions {
  headers?: IHeaders;
  include?: string | Array<string>;
  filter?: IFilters;
  sort?: string | Array<string>;
  fields?: IDictionary<string | Array<string>>;
  params?: Array<{key: string; value: string} | string>;
  skipCache?: boolean;
}
