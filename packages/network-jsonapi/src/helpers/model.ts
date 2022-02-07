import {
  getModelId,
  getModelType,
  getRefId,
  IFieldDefinition,
  IModelRef,
  IReferenceOptions,
  modelToJSON,
  PureModel,
  ReferenceType,
  modelToDirtyJSON,
} from '@datx/core';
import { DEFAULT_TYPE, getMeta, IRawModel, mapItems, META_FIELD } from '@datx/utils';
import { isModelPersisted } from '@datx/network';

import {
  MODEL_LINKS_FIELD,
  MODEL_META_FIELD,
  MODEL_REF_LINKS_FIELD,
  MODEL_REF_META_FIELD,
} from '../consts';
import { IDefinition, ILink, IRecord, IRelationship } from '../interfaces/JsonApi';
// import { prepareQuery } from './url';
import { getModelClassRefs } from './utils';
import { IRequestOptions } from '../interfaces/IRequestOptions';

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
        obj[key] = { referenceDef: false };

        return obj;
      }, {}),
      id: data.id,
      [MODEL_LINKS_FIELD]: data.links,
      [MODEL_META_FIELD]: data.meta,
      PERSISTED: Boolean(data.id),
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
                  (ref.data instanceof Array ? ref.data[0].type : ref.data?.type) || DEFAULT_TYPE,
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

export function getModelRefLinks(model: PureModel): Record<string, Record<string, ILink>> {
  return getMeta(model, MODEL_REF_LINKS_FIELD, {});
}

export function getModelRefMeta(model: PureModel): Record<string, any> {
  return getMeta(model, MODEL_REF_META_FIELD, {});
}

// TODO fetchModelLink
// export function fetchModelLink<T extends IJsonapiModel = IJsonapiModel>(
//   model: PureModel,
//   key: string,
//   options?: IRequestOptions,
// ): Promise<Response<T>> {
//   const collection = getModelCollection(model);
//   const links = getModelLinks(model);

//   if (!links || !(key in links)) {
//     throw error(`Link ${key} doesn't exist on the model`);
//   }
//   const link = links[key];
//   const responseObj = fetchLink<T>(link, collection as unknown as IJsonapiCollection, options);

//   if (getMeta(model, MODEL_QUEUE_FIELD)) {
//     return responseObj.then((response) => {
//       const related = getMeta(model, MODEL_RELATED_FIELD);
//       const prop = getMeta(model, MODEL_PROP_FIELD);
//       const record = response.data;
//       const recordType = record && getModelType(record);

//       if (record && recordType !== getModelType(model) && recordType === getModelType(related)) {
//         if (prop) {
//           related[prop] = record;

//           return response;
//         }
//         setMeta(related, MODEL_PERSISTED_FIELD, true);

//         return response.replaceData(related) as Response<T>;
//       }

//       return response;
//     });
//   }

//   return responseObj;
// }

// TODO getLink
// function getLink(model: PureModel, ref: string, key: string): ILink {
//   const collection = getModelCollection(model);

//   if (!collection) {
//     throw error('The model needs to be in a collection');
//   }
//   const links = getModelRefLinks(model);

//   if (!links || !(ref in links)) {
//     throw error(`The reference ${ref} doesn't have any links`);
//   }
//   const refLinks = links[ref];

//   if (!refLinks || !(key in refLinks)) {
//     throw error(`Link ${key} doesn't exist on the model`);
//   }

//   return refLinks[key];
// }

// TODO fetchModelRefLink
// export function fetchModelRefLink<T extends IJsonapiModel = IJsonapiModel>(
//   model: PureModel,
//   ref: string,
//   key: string,
//   options?: IRequestOptions,
// ): Promise<Response<T>> {
//   const collection = getModelCollection(model);
//   const link = getLink(model, ref, key);

//   return fetchLink<T>(link, collection as unknown as IJsonapiCollection, options);
// }

export function modelToJsonApi(model: PureModel, onlyDirty?: boolean): IRecord {
  const staticModel = model.constructor as typeof PureModel;
  const attributes: Record<string, any> = onlyDirty ? modelToDirtyJSON(model) : modelToJSON(model);

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

// TODO getModelEndpointUrl
export function getModelEndpointUrl(_model: PureModel, _options?: IRequestOptions): string {
  // 1. define the base url
  // 2. define the endpoint
  // 3. define the query params

  return '';
  // const queryData = prepareQuery(
  //   getModelType(model),
  //   isModelPersisted(model) ? getModelId(model) : undefined,
  //   undefined,
  //   options,
  //   undefined,
  //   model,
  // );

  // return queryData.url;
}

// TODO saveRelationship
// export function saveRelationship<T extends IJsonapiModel>(
//   model: T,
//   ref: string,
//   options?: IRequestOptions,
// ): Promise<T> {
//   const collection = getModelCollection(model) as unknown as IJsonapiCollection;
//   const link = getLink(model, ref, 'self');
//   const href: string = typeof link === 'object' ? link.href : link;

//   const modelRefs = getRefId(model, ref);
//   const fields: IFieldDefinition = getMeta<IFieldDefinition>(model, 'fields')?.[ref];
//   const type = fields?.referenceDef ? fields.referenceDef.model : null;

//   type ID = IDefinition | Array<IDefinition>;
//   const data: ID = mapItems(modelRefs, (refItem: IModelRef) => ({
//     id: refItem.id,
//     type: refItem.type || type,
//   })) as ID;

//   return update(
//     href,
//     { data },
//     collection,
//     options && options.networkConfig && options.networkConfig.headers,
//   ).then(handleResponse(model, ref));
// }
