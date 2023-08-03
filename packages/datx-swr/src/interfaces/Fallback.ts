import { IRawResponse } from '@datx/jsonapi';

export type FallbackResponse = Omit<IRawResponse, 'collection'>;

export type Fallback = Record<
  string,
  FallbackResponse | Array<FallbackResponse> | { op: 'getAll'; data: Array<FallbackResponse> }
>;
