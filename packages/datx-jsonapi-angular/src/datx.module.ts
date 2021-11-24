import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { IConfigType } from '@datx/jsonapi/dist/NetworkUtils';
import { CachingStrategy } from '@datx/network';
import { initDatxFactory } from './initializers/init-datx-factory';
import { DATX_CONFIG } from './injection-tokens';
import { CustomFetchService } from './services/custom-fetch/custom-fetch.service';

export const DEFAULT_DATX_CONFIG: Partial<IConfigType> = {
  baseUrl: '/',
  cache: CachingStrategy.NetworkOnly,
  defaultFetchOptions: {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/vnd.api+json',
    },
  },
};

@NgModule()
export class DatxModule {
  static forRoot(
    config: Partial<IConfigType> = DEFAULT_DATX_CONFIG,
  ): ModuleWithProviders<DatxModule> {
    return {
      ngModule: DatxModule,
      providers: [
        CustomFetchService,
        {
          provide: APP_INITIALIZER,
          useFactory: initDatxFactory(config),
          multi: true,
          deps: [CustomFetchService, DATX_CONFIG],
        },
      ],
    };
  }
}