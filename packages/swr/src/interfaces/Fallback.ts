import { IRawResponse } from '@datx/jsonapi';

export type Fallback = Record<string, Omit<IRawResponse, 'collection'>>;
