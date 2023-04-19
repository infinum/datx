import { PureCollection, PureModel } from '@datx/core';
import { IRawModel, META_FIELD, setMeta } from '@datx/utils';
import { IRecord } from '@datx/jsonapi-types';

import {
  DATX_JSONAPI_CLASS,
  MODEL_LINKS_FIELD,
  MODEL_META_FIELD,
  MODEL_PERSISTED_FIELD,
  MODEL_REF_LINKS_FIELD,
  MODEL_REF_META_FIELD,
} from './consts';
import { flattenModel, removeModel, saveModel } from './helpers/model';
import { getModelClassRefs } from './helpers/utils';
import { IRequestOptions } from './interfaces/IRequestOptions';
import { IJsonapiModel } from './interfaces/IJsonapiModel';

const HYDRATIZATION_KEYS = [
  MODEL_LINKS_FIELD,
  MODEL_META_FIELD,
  MODEL_PERSISTED_FIELD,
  MODEL_REF_LINKS_FIELD,
  MODEL_REF_META_FIELD,
];

export function decorateModel(BaseClass: typeof PureModel): typeof PureModel {
  class JsonapiModel extends BaseClass {
    public static [DATX_JSONAPI_CLASS] = true;

    /**
     * Should the autogenerated ID be sent to the server when creating a record
     *
     * @static
     * @type {boolean}
     * @memberOf Record
     */
    public static useAutogeneratedIds: boolean = BaseClass['useAutogeneratedIds'] || false;

    /**
     * Endpoint for API requests if there is no self link
     *
     * @static
     * @type {string|() => string}
     * @memberOf Record
     */
    public static endpoint: string | (() => string);

    public static getAutoId(): string {
      return super.getAutoId().toString();
    }

    constructor(rawData: IRawModel | IRecord = {}, collection?: PureCollection) {
      let data = rawData;

      if (rawData && 'type' in rawData && ('attributes' in rawData || 'relationships' in rawData)) {
        const classRefs = getModelClassRefs(BaseClass);

        data = flattenModel(classRefs, rawData as IRecord);
      }
      super(data, collection);

      const modelMeta = data?.[META_FIELD] || {};

      HYDRATIZATION_KEYS.forEach((key) => {
        if (key in modelMeta) {
          setMeta(this, key, modelMeta[key]);
        }
      });
    }

    public save(options?: IRequestOptions): Promise<IJsonapiModel> {
      return saveModel(this as unknown as IJsonapiModel, options);
    }

    public destroy(options?: IRequestOptions): Promise<void> {
      return removeModel(this, options);
    }
  }

  return JsonapiModel as typeof PureModel;
}
