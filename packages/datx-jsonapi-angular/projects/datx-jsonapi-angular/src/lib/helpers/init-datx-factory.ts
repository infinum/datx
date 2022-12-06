import { config, IConfigType } from '@datx/jsonapi';
import { DEFAULT_DATX_ANGULAR_JSON_API_CONFIG } from '../datx.module';
import { CustomFetchService } from '../services/custom-fetch/custom-fetch.service';

export function initDatxFactory(staticConfig: Partial<IConfigType> = {}) {
  return (
    customFetch: CustomFetchService,
    dynamicConfig?: Partial<IConfigType>,
  ): (() => Promise<void>) => {
    const mergedConfig: Partial<IConfigType> = {
      ...DEFAULT_DATX_ANGULAR_JSON_API_CONFIG,
      ...staticConfig,
      ...dynamicConfig,
    };

    return () => {
      Object.assign(config, mergedConfig);

      if (!staticConfig.baseFetch && !dynamicConfig?.baseFetch) {
        config.baseFetch = customFetch.fetch.bind(customFetch);
      }

      return Promise.resolve();
    };
  };
}
