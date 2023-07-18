export { jsonapi, jsonapiModel, jsonapiCollection, jsonapiView } from './mixin';

export { Response } from './Response';

export { NetworkResponse } from './NetworkResponse';

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
  saveRelationship,
  isModelPersisted,
  saveModel,
} from './helpers/model';

export { prepareQuery, buildUrl } from './helpers/url';

export { isJsonApiClass } from './helpers/utils';

export { getResponseRawData } from './helpers/response';

export { BaseJsonapiRequest } from './BaseRequest';

export { ICollectionFetchOpts } from './interfaces/ICollectionFetchOpts';

export { IJsonapiCollection } from './interfaces/IJsonapiCollection';

export { IJsonapiModel } from './interfaces/IJsonapiModel';

export { IJsonapiView } from './interfaces/IJsonapiView';

export { IRawResponse } from './interfaces/IRawResponse';

export { IRequestOptions } from './interfaces/IRequestOptions';

export { IResponseSnapshot } from './interfaces/IResponseSnapshot';

export { IGetAllResponse } from './interfaces/IGetAllResponse';

export {
  /**
   * @deprecated import directly form `@datx/jsonapi-types`. Will be removed in v3 and renamed to `IResourceObject`
   */
  IRecord,
  /**
   * @deprecated import directly form `@datx/jsonapi-types`. Will be removed in v3 and renamed to `IDocument`
   */
  IResponse,
  /**
   * @deprecated import directly form `@datx/jsonapi-types`.
   * Will be removed in v3 and renamed to `IResourceIdentifierObject`
   */
  IDefinition,
} from '@datx/jsonapi-types';

export { config, fetchLink, IConfigType } from './NetworkUtils';

export {
  BaseRequest,
  addInterceptor,
  cache,
  method,
  setUrl,
  body,
  query,
  header,
  params,
  fetchReference,
  encodeQueryString,
  paramArrayType,
  serializer,
  parser,
  collection,
  ParamArrayType,
  CachingStrategy,
  HttpMethod,
  IFetchOptions,
  IHeaders,
  IInterceptor,
  INetworkHandler,
  IPipeOperator,
  IResponseObject,
  clearAllCache,
  clearCacheByType,
} from '@datx/network';

export {
  MODEL_LINKS_FIELD,
  MODEL_META_FIELD,
  MODEL_PERSISTED_FIELD,
  MODEL_REF_LINKS_FIELD,
  MODEL_REF_META_FIELD,
} from './consts';
