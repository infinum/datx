import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { initDatxFactory } from './initializers/init-datx-factory';
import { DATX_CONFIG } from './injection-tokens';
import { IDatxConfig } from './interfaces/IDatxConfig';
import { CustomFetchService } from './services/custom-fetch/custom-fetch.service';

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
