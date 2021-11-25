import { config } from '@datx/jsonapi';
import { IConfigType } from '@datx/jsonapi/dist/NetworkUtils';
import { DEFAULT_DATX_CONFIG } from '../datx.module';
import { CustomFetchService } from '../services/custom-fetch/custom-fetch.service';

export function initDatxFactory(staticConfig: Partial<IConfigType> = {}) {
  return (
    customFetch: CustomFetchService,
    dynamicConfig: Partial<IConfigType>,
  ): (() => Promise<void>) => {
    const mergedConfig: Partial<IConfigType> = {
      ...DEFAULT_DATX_CONFIG,
      ...staticConfig,
      ...dynamicConfig,
    };

    return async () => {
      Object.assign(config, mergedConfig);

      config.baseFetch = customFetch.fetch.bind(customFetch);
    };
  };
}
