import {
  getModelCollection,
  getModelId,
  getModelType,
  getRefId,
  IFieldDefinition,
  IModelRef,
  IReferenceOptions,
  modelToJSON,
  PureModel,
  ReferenceType,
} from 'datx';
import { getMeta, IRawModel, mapItems, META_FIELD, setMeta } from 'datx-utils';

import { clearCacheByType } from '../cache';
import {
  MODEL_LINKS_FIELD,
  MODEL_META_FIELD,
  MODEL_PERSISTED_FIELD,
  MODEL_PROP_FIELD,
  MODEL_QUEUE_FIELD,
  MODEL_REF_LINKS_FIELD,
  MODEL_REF_META_FIELD,
  MODEL_RELATED_FIELD,
} from '../consts';
import { IJsonapiCollection } from '../interfaces/IJsonapiCollection';
import { IJsonapiModel } from '../interfaces/IJsonapiModel';
import { IRequestOptions } from '../interfaces/IRequestOptions';
import { IDefinition, ILink, IRecord, IRelationship } from '../interfaces/JsonApi';
import { create, fetchLink, handleResponse, remove, update } from '../NetworkUtils';
import { Response } from '../Response';
import { prepareQuery } from './url';
import { error, getModelClassRefs } from './utils';
import { GenericModel } from '../GenericModel';

export function flattenModel(classRefs): null;
export function flattenModel(classRefs, data?: IRecord): IRawModel;
export function flattenModel(
  classRefs: Record<string, IReferenceOptions<PureModel>>,
  data?: IRecord,
): IRawModel | null {
  if (!data) {
    return null;
  }

  const rawData = {
    [META_FIELD]: {
      fields: Object.keys(data.attributes || {}).reduce((obj, key) => {
        // eslint-disable-next-line no-param-reassign
        obj[key] = { referenceDef: false };

        return obj;
      }, {}),
      id: data.id,
      [MODEL_LINKS_FIELD]: data.links,
      [MODEL_META_FIELD]: data.meta,
      [MODEL_PERSISTED_FIELD]: Boolean(data.id),
      type: data.type,
    },
  };

  if (data.relationships) {
    const refLinks = {};
    const refMeta = {};
    const refs: Record<string, IFieldDefinition> = {};

    Object.keys(data.relationships).forEach((key) => {
      const ref = (data.relationships as Record<string, IRelationship>)[key];

      if (ref && 'data' in ref && (ref.data || ref.data === null)) {
        if (!(ref.data instanceof Array) || ref.data.length > 0) {
          rawData[key] = ref.data;
          if (!classRefs || !(key in classRefs)) {
            refs[key] = {
              referenceDef: {
                model:
                  (ref.data instanceof Array ? ref.data[0].type : ref.data?.type) ||
                  GenericModel.type,
                type: ref.data instanceof Array ? ReferenceType.TO_MANY : ReferenceType.TO_ONE,
              },
            };
          }
        } else {
          rawData[key] = [];
        }
      }
      if (ref && 'links' in ref) {
        refLinks[key] = ref.links;
      }
      if (ref && 'meta' in ref) {
        refMeta[key] = ref.meta;
      }
    });

    Object.assign(rawData[META_FIELD].fields, refs);
    rawData[META_FIELD][MODEL_REF_LINKS_FIELD] = refLinks;
    rawData[META_FIELD][MODEL_REF_META_FIELD] = refMeta;
  }

  return Object.assign(rawData, data.attributes);
}

export function getModelMeta(model: PureModel): Record<string, any> {
  return getMeta(model, MODEL_META_FIELD, {});
}

export function getModelLinks(model: PureModel): Record<string, ILink> {
  return getMeta(model, MODEL_LINKS_FIELD, {});
}

export function fetchModelLink<T extends IJsonapiModel = IJsonapiModel>(
  model: PureModel,
  key: string,
  options?: IRequestOptions,
): Promise<Response<T>> {
  const collection = getModelCollection(model);
  const links = getModelLinks(model);

  if (!links || !(key in links)) {
    throw error(`Link ${key} doesn't exist on the model`);
  }
  const link = links[key];
  const responseObj = fetchLink<T>(link, (collection as unknown) as IJsonapiCollection, options);

  if (getMeta(model, MODEL_QUEUE_FIELD)) {
    return responseObj.then((response) => {
      const related = getMeta(model, MODEL_RELATED_FIELD);
      const prop = getMeta(model, MODEL_PROP_FIELD);
      const record = response.data;
      const recordType = record && getModelType(record);

      if (record && recordType !== getModelType(model) && recordType === getModelType(related)) {
        if (prop) {
          related[prop] = record;

          return response;
        }
        setMeta(related, MODEL_PERSISTED_FIELD, true);

        return response.replaceData(related);
      }

      return response;
    });
  }

  return responseObj;
}

export function getModelRefLinks(model: PureModel): Record<string, Record<string, ILink>> {
  return getMeta(model, MODEL_REF_LINKS_FIELD, {});
}

function getLink(model: PureModel, ref: string, key: string): ILink {
  const collection = getModelCollection(model);

  if (!collection) {
    throw error('The model needs to be in a collection');
  }
  const links = getModelRefLinks(model);

  if (!links || !(ref in links)) {
    throw error(`The reference ${ref} doesn't have any links`);
  }
  const refLinks = links[ref];

  if (!refLinks || !(key in refLinks)) {
    throw error(`Link ${key} doesn't exist on the model`);
  }

  return refLinks[key];
}

export function fetchModelRefLink<T extends IJsonapiModel = IJsonapiModel>(
  model: PureModel,
  ref: string,
  key: string,
  options?: IRequestOptions,
): Promise<Response<T>> {
  const collection = getModelCollection(model);
  const link = getLink(model, ref, key);

  return fetchLink<T>(link, (collection as unknown) as IJsonapiCollection, options);
}

export function getModelRefMeta(model: PureModel): Record<string, any> {
  return getMeta(model, MODEL_REF_META_FIELD, {});
}

function isModelPersisted(model: PureModel): boolean {
  return getMeta(model, MODEL_PERSISTED_FIELD, false);
}

function setModelPersisted(model: PureModel, status: boolean): void {
  setMeta(model, MODEL_PERSISTED_FIELD, status);
}

export function modelToJsonApi(model: IJsonapiModel): IRecord {
  const staticModel = model.constructor as typeof PureModel;
  const attributes: Record<string, any> = modelToJSON(model);

  const useAutogenerated: boolean = staticModel['useAutogeneratedIds'];
  const isPersisted = isModelPersisted(model);

  const data: IRecord = {
    attributes,
    id: isPersisted || useAutogenerated ? getModelId(model).toString() : undefined,
    type: getModelType(model) as string,
  };

  const refs = getModelClassRefs(model);

  Object.keys(refs).forEach((key) => {
    if (refs[key].property) {
      return;
    }
    data.relationships = data.relationships || {};
    const refsList: IModelRef | Array<IModelRef> | null = getRefId(model, key);

    data.relationships[key] = {
      data: mapItems(refsList, (refItem: IModelRef) => ({
        id: refItem.id.toString(),
        type: refItem.type,
      })) as IDefinition | Array<IDefinition>,
    };
    if (data.attributes) {
      delete data.attributes[key];
    }
  });

  if (data.attributes) {
    delete data.attributes.id;
    delete data.attributes[META_FIELD];
  }

  return data;
}

export function getModelEndpointUrl(model: IJsonapiModel, options?: IRequestOptions): string {
  const queryData = prepareQuery(
    getModelType(model),
    isModelPersisted(model) ? getModelId(model) : undefined,
    undefined,
    options,
    undefined,
    model,
  );

  return queryData.url;
}

export function saveModel(model: IJsonapiModel, options?: IRequestOptions): Promise<IJsonapiModel> {
  const collection = (getModelCollection(model) as unknown) as IJsonapiCollection;

  const data: IRecord = modelToJsonApi(model);
  const requestMethod = isModelPersisted(model) ? update : create;
  const url = getModelEndpointUrl(model, options);

  return requestMethod(
    url,
    { data },
    collection,
    options && options.networkConfig && options.networkConfig.headers,
  )
    .then(handleResponse(model))
    .then((response) => {
      clearCacheByType(getModelType(model));

      return response;
    });
}

export function removeModel<T extends IJsonapiModel>(
  model: T,
  options?: IRequestOptions,
): Promise<void> {
  const collection = (getModelCollection(model) as unknown) as IJsonapiCollection;

  const isPersisted = isModelPersisted(model);
  const url = getModelEndpointUrl(model);

  if (isPersisted) {
    return remove(
      url,
      collection,
      options && options.networkConfig && options.networkConfig.headers,
    ).then((response: Response<T>) => {
      if (response.error) {
        throw response.error;
      }

      setModelPersisted(model, false);

      if (collection) {
        collection.removeOne(model);
      }
    });
  }

  if (collection) {
    collection.removeOne(model);
  }

  return Promise.resolve();
}

export function saveRelationship<T extends IJsonapiModel>(
  model: T,
  ref: string,
  options?: IRequestOptions,
): Promise<T> {
  const collection = (getModelCollection(model) as unknown) as IJsonapiCollection;
  const link = getLink(model, ref, 'self');
  const href: string = typeof link === 'object' ? link.href : link;

  const modelRefs = getRefId(model, ref);
  const fields: IFieldDefinition = getMeta<IFieldDefinition>(model, 'fields')?.[ref];
  const type = fields?.referenceDef ? fields.referenceDef.model : null;

  type ID = IDefinition | Array<IDefinition>;
  const data: ID = mapItems(modelRefs, (refItem: IModelRef) => ({
    id: refItem.id,
    type: refItem.type || type,
  })) as ID;

  return update(
    href,
    { data },
    collection,
    options && options.networkConfig && options.networkConfig.headers,
  ).then(handleResponse(model, ref));
}
