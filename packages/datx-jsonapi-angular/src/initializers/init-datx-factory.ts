import { config } from '@datx/jsonapi';
import { DEFAULT_DATX_CONFIG, IDatxConfig } from '../interfaces/IDatxConfig';
import { CustomFetchService } from '../services/custom-fetch/custom-fetch.service';

export function initDatxFactory(staticConfig: Partial<IDatxConfig> = {}) {
  return (
    customFetch: CustomFetchService,
    dynamicConfig: Partial<IDatxConfig>,
  ): (() => Promise<void>) => {
    const mergedConfig: IDatxConfig = {
      ...DEFAULT_DATX_CONFIG,
      ...staticConfig,
      ...dynamicConfig,
    };

    return async () => {
      config.baseFetch = customFetch.fetch.bind(customFetch);

      config.defaultFetchOptions = {
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          ...mergedConfig.additionalHeaders,
        },
      };

      config.baseUrl = mergedConfig.baseUrl;
      config.maxCacheAge = mergedConfig.maxCacheAge;
      config.cache = mergedConfig.cache;
    };
  };
}
