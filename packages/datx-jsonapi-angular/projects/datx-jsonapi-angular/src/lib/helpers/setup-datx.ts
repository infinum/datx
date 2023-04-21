import { HttpClient } from '@angular/common/http';
import { CachingStrategy, IConfigType, config } from '@datx/jsonapi';
import { CustomFetchService } from '../services/custom-fetch/custom-fetch.service';

const DEFAULT_DATX_ANGULAR_JSON_API_CONFIG: Partial<IConfigType> = {
  baseUrl: '/',
  cache: CachingStrategy.NetworkOnly,
  defaultFetchOptions: {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
    },
  },
};

export function setupDatx(http: HttpClient, partialConfig: Partial<IConfigType>): IConfigType {
  const baseFetch = new CustomFetchService(http);
  const mergedConfig = {
    ...DEFAULT_DATX_ANGULAR_JSON_API_CONFIG,
    ...partialConfig,
  };
  config.baseFetch = baseFetch.fetch.bind(baseFetch);

  Object.assign(config, mergedConfig);

  return config;
}
