import {
  getModelCollection,
  getModelId,
  getModelMetaKey,
  getModelType,
  getRefId,
  IIdentifier,
  IReferenceOptions,
  modelToJSON,
  PureModel,
  ReferenceType,
  setModelMetaKey,
} from 'datx';
import { IDictionary, IRawModel, mapItems, META_FIELD } from 'datx-utils';
import { isObservableArray } from 'mobx';

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
import { error } from './utils';

export function flattenModel(classRefs): null;
export function flattenModel(classRefs, data?: IRecord): IRawModel;
export function flattenModel(classRefs: IDictionary<IReferenceOptions<PureModel>>, data?: IRecord): IRawModel|null {
  if (!data) {
    return null;
  }

  const rawData = {
    [META_FIELD]: {
      fields: Object.keys(data.attributes || { }),
      id: data.id,
      [MODEL_LINKS_FIELD]: data.links,
      [MODEL_META_FIELD]: data.meta,
      [MODEL_PERSISTED_FIELD]: Boolean(data.id),
      refs: { },
      type: data.type,
    },
  };

  if (data.relationships) {
    const refLinks = { };
    const refMeta = { };
    const refs = { };
    Object.keys(data.relationships).forEach((key) => {
      const ref = (data.relationships as IDictionary<IRelationship>)[key];
      if (ref && 'data' in ref && ref.data) {
        if ((!(ref.data instanceof Array) || ref.data.length > 0)) {
          rawData[key] = mapItems(ref.data, (item: IDefinition) => item.id);
          if (!classRefs || !(key in classRefs)) {
            refs[key] = {
              model: ref.data instanceof Array ? ref.data[0].type : ref.data.type,
              type: ref.data instanceof Array ? ReferenceType.TO_MANY : ReferenceType.TO_ONE,
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

      rawData[META_FIELD].fields.push(...Object.keys(refs));
    });

    rawData[META_FIELD].refs = refs;
    rawData[META_FIELD][MODEL_REF_LINKS_FIELD] = refLinks;
    rawData[META_FIELD][MODEL_REF_META_FIELD] = refMeta;
  }

  return Object.assign(rawData, data.attributes);
}

export function getModelMeta(model: PureModel): IDictionary {
  return getModelMetaKey(model, MODEL_META_FIELD);
}

export function getModelLinks(model: PureModel): IDictionary<ILink> {
  return getModelMetaKey(model, MODEL_LINKS_FIELD);
}

export async function fetchModelLink<T extends IJsonapiModel = IJsonapiModel>(
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
  const responseObj = fetchLink<T>(link, collection as IJsonapiCollection, options);

  if (getModelMetaKey(model, MODEL_QUEUE_FIELD)) {
    return responseObj.then((response) => {
      const related = getModelMetaKey(model, MODEL_RELATED_FIELD);
      const prop = getModelMetaKey(model, MODEL_PROP_FIELD);
      const record = response.data;
      const recordType = record && getModelType(record);
      if (record && recordType !== getModelType(model) && recordType === getModelType(related)) {
        if (prop) {
          related[prop] = record;

          return response;
        }
        setModelMetaKey(related, MODEL_PERSISTED_FIELD, true);

        return response.replaceData(related);
      }

      return response;
    });
  }

  return responseObj;
}

function getLink(model: PureModel, ref: string, key: string) {
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

export async function fetchModelRefLink<T extends IJsonapiModel = IJsonapiModel>(
  model: PureModel,
  ref: string,
  key: string,
  options?: IRequestOptions,
): Promise<Response<T>> {
  const collection = getModelCollection(model);
  const link = getLink(model, ref, key);

  return fetchLink<T>(link, collection as IJsonapiCollection, options);
}

export function getModelRefLinks(model: PureModel): IDictionary<IDictionary<ILink>> {
  return getModelMetaKey(model, MODEL_REF_LINKS_FIELD);
}

export function getModelRefMeta(model: PureModel): IDictionary {
  return getModelMetaKey(model, MODEL_REF_META_FIELD);
}

function isModelPersisted(model: PureModel): boolean {
  return getModelMetaKey(model, MODEL_PERSISTED_FIELD);
}

function setModelPersisted(model: PureModel, status: boolean) {
  setModelMetaKey(model, MODEL_PERSISTED_FIELD, status);
}

export function modelToJsonApi(model: IJsonapiModel): IRecord {
  const staticModel = model.constructor as typeof PureModel;
  const attributes: IDictionary = modelToJSON(model);

  const useAutogenerated: boolean = staticModel['useAutogeneratedIds'];
  const isPersisted = isModelPersisted(model);

  const data: IRecord = {
    attributes,
    id: (isPersisted || useAutogenerated) ? getModelId(model).toString() : undefined,
    type: getModelType(model) as string,
  };

  const refs = getModelMetaKey(model, 'refs');

  Object.keys(refs).forEach((key) => {
    data.relationships = data.relationships || { };
    const refIds = mapItems(getRefId(model, key), (refId: IIdentifier) =>
      (refId || '').toString(),
    ) as string | Array<string> | null;

    let rel: IDefinition|Array<IDefinition>|undefined;
    if (refIds instanceof Array || isObservableArray(refIds)) {
      rel = (refIds as Array<string>).map((id, index) => {
        const type = getModelType(model[key][index] ? model[key][index] : refs[key].model).toString();

        if (!type) {
          throw error(`The model type can't be retrieved for the reference ${key}`);
        }

        return { id, type };
      });
    } else {
      const type: string = getModelType(model[key] ? model[key] : refs[key].model).toString();

      if (!type) {
        throw error(`The model type can't be retrieved for the reference ${key}`);
      }

      rel = refIds ? { id: refIds, type } : undefined;
    }

    data.relationships[key] = { data: rel || null };
    if (data.attributes) {
      // tslint:disable-next-line:no-dynamic-delete
      delete data.attributes[key];
    }
  });

  if (data.attributes) {
    delete data.attributes.id;
    // tslint:disable-next-line:no-dynamic-delete
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
  const collection = getModelCollection(model) as IJsonapiCollection;

  const data: IRecord = modelToJsonApi(model);
  const requestMethod = isModelPersisted(model) ? update : create;
  const url = getModelEndpointUrl(model, options);

  return requestMethod(url, { data }, collection, options && options.networkConfig && options.networkConfig.headers)
    .then(handleResponse(model))
    .then((response) => {
      clearCacheByType(getModelType(model));

      return response;
    });
}

export function removeModel<T extends IJsonapiModel>(model: T, options?: IRequestOptions): Promise<void> {
  const collection = getModelCollection(model) as IJsonapiCollection;

  const isPersisted = isModelPersisted(model);
  const url = getModelEndpointUrl(model);

  if (isPersisted) {
    return remove(url, collection, options && options.networkConfig && options.networkConfig.headers)
      .then((response: Response<T>) => {
        if (response.error) {
          throw response.error;
        }

        setModelPersisted(model, false);

        if (collection) {
          collection.removeOne(model);
        }
      });
  } else if (collection) {
    collection.removeOne(model);
  }

  return Promise.resolve();
}

export function saveRelationship<T extends IJsonapiModel>(
  model: T,
  ref: string,
  options?: IRequestOptions,
): Promise<T> {
  const collection = getModelCollection(model) as IJsonapiCollection;
  const link = getLink(model, ref, 'self');
  const href: string = typeof link === 'object' ? link.href : link;

  const ids = getRefId(model, ref);
  const type = getModelType(getModelMetaKey(model, 'refs')[ref].model);
  type ID = IDefinition|Array<IDefinition>;
  const data: ID = mapItems(ids, (id) => ({ id, type })) as ID;

  return update(href, { data }, collection, options && options.networkConfig && options.networkConfig.headers)
    .then(handleResponse(model, ref));
}
