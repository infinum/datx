/*
 * Public API Surface of datx-jsonapi-angular
 */

export { jsonapiAngular } from './lib/mixin';

export { Response } from './lib/Response';

export { IJsonapiCollection } from './lib/interfaces/IJsonapiCollection';

export { IJsonapiModel } from './lib/interfaces/IJsonapiModel';

export { IJsonapiView } from './lib/interfaces/IJsonapiView';

export { setupDatx } from './lib/helpers/setup-datx';

export { DATX_CONFIG, APP_COLLECTION } from './lib/injection-tokens';

export { CollectionService } from './lib/services/collection/collection.service';

export { CollectionTestingService } from './lib/services/collection/collection.testing.service';
