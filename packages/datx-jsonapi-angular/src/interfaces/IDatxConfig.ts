import { CachingStrategy } from '@datx/network';

export interface IDatxConfig {
  cache: CachingStrategy;
  maxCacheAge: number;
  baseUrl: string;
  additionalHeaders: Record<string, string>;
}

export const DEFAULT_DATX_CONFIG: IDatxConfig = {
  baseUrl: '/',
  maxCacheAge: 10,
  cache: CachingStrategy.NetworkOnly,
  additionalHeaders: {},
};
