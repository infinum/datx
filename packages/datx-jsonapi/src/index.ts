export { jsonapi } from './mixin';
export { Response } from './Response';
export { config } from './NetworkUtils';
export { ParamArrayType } from './enums/ParamArrayType';
export { GenericModel } from './GenericModel';

export {
  fetchModelLink,
  fetchModelRefLink,
  getModelLinks,
  getModelMeta,
  getModelRefLinks,
  getModelRefMeta,
  getModelEndpointUrl,
  modelToJsonApi,
  saveModel,
  saveRelationship,
  isModelPersisted,
} from './helpers/model';

export { clearAllCache, clearCacheByType } from './cache';

export { ICollectionFetchOpts } from './interfaces/ICollectionFetchOpts';
export { IJsonapiCollection } from './interfaces/IJsonapiCollection';
export { IJsonapiModel } from './interfaces/IJsonapiModel';
export { IJsonapiView } from './interfaces/IJsonapiView';
export { IRawResponse } from './interfaces/IRawResponse';
export { IRequestOptions } from './interfaces/IRequestOptions';
