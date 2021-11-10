import { APP_INITIALIZER, InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { CachingStrategy, config } from '@datx/jsonapi';
import { CustomFetchService } from './custom-fetch.service';

interface IDatxConfig {
  cache: CachingStrategy;
  maxCacheAge: number;
  baseUrl: string;
  additionalHeaders: Record<string, string>;
}

export const DATX_CONFIG = new InjectionToken<Partial<IDatxConfig>>('DATX_CONFIG');

const DEFAULT_DATX_CONFIG: IDatxConfig = {
  baseUrl: '/',
  maxCacheAge: 10,
  cache: CachingStrategy.NetworkOnly,
  additionalHeaders: {},
};

function initDatxFactory(staticConfig: Partial<IDatxConfig> = {}) {
  return (customFetch: CustomFetchService, dynamicConfig: Partial<IDatxConfig>) => {
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

@NgModule()
export class DatxModule {
  static forRoot(staticConfig?: Partial<IDatxConfig>): ModuleWithProviders<DatxModule> {
    return {
      ngModule: DatxModule,
      providers: [
        {
          provide: APP_INITIALIZER,
          useFactory: initDatxFactory(staticConfig),
          multi: true,
          deps: [CustomFetchService, DATX_CONFIG],
        },
      ],
    };
  }
}
