/*
 * Public API Surface of datx-jsonapi-angular
 */

export { jsonapiAngular } from './lib/mixin';

export { Response } from './lib/Response';

export { IJsonapiCollection } from './lib/interfaces/IJsonapiCollection';
export { IJsonapiModel } from './lib/interfaces/IJsonapiModel';
export { IJsonapiView } from './lib/interfaces/IJsonapiView';

export { DatxModule } from './lib/datx.module';
export { DATX_CONFIG, APP_COLLECTION } from './lib/injection-tokens';
export { CollectionService } from './lib/services/collection/collection.service';
export { CollectionTestingService } from './lib/services/collection/collection.testing.service';
