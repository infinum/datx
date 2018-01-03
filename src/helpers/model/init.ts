import {computed, extendObservable} from 'mobx';

import {META_FIELD} from '../../consts';
import {FieldType} from '../../enums/FieldType';
import {ReferenceType} from '../../enums/ReferenceType';
import {MODEL_EXISTS} from '../../errors';
import {IDictionary} from '../../interfaces/IDictionary';
import {IRawModel} from '../../interfaces/IRawModel';
import {IReferenceOptions} from '../../interfaces/IReferenceOptions';
import {TRefValue} from '../../interfaces/TRefValue';
import {Model} from '../../Model';
import {storage} from '../../services/storage';
import {error} from '../format';
import {getField, getRef, updateField, updateRef} from './fields';
import {getModelType} from './utils';

interface IMetaToInit extends IDictionary<any> {
  fields: Array<string>;
  refs: IDictionary<IReferenceOptions>;
}

export function initModelField<T extends Model>(obj: T, key: string, defValue: any, type: FieldType = FieldType.DATA) {
  const fields = storage.getModelMetaKey(obj, 'fields') as Array<string>;
  if (fields.indexOf(key) === -1) {
    // Initialize the observable field to the default value
    storage.setModelDataKey(obj, key, defValue);
    fields.push(key);

    // Set up the computed prop
    extendObservable(obj, {
      [key]: computed(
        () => getField(obj, key),
        (value) => updateField(obj, key, value, type),
      ),
    });
  } else {
    obj[key] = defValue;
  }
}

/**
 * Initialize a reference to other models
 *
 * @export
 * @template T
 * @param {T} obj Model to which the reference should be added
 * @param {string} key Model property where the reference will be defined
 * @param {IReferenceOptions} options Reference options
 * @param {TRefValue} initialVal Initial reference value
 */
export function initModelRef<T extends Model>(obj: T, key: string, options: IReferenceOptions, initialVal: TRefValue) {
  const refs = storage.getModelMetaKey(obj, 'refs');

  if (!(key in refs)) {
    // Initialize the observable field to the given value
    refs[key] = options;

    const isArray = options.type === ReferenceType.TO_MANY;
    storage.setModelDataKey(obj, key, isArray ? [] : undefined);

    // Set up the computed prop
    extendObservable(obj, {
      [key]: computed(
        () => getRef(obj, key),
        (value) => updateRef(obj, key, value),
      ),
    });
  }

  if (!options.property) {
    obj[key] = initialVal;
  }
}

function prepareFields(data: IRawModel, meta: IMetaToInit, model: Model) {
  const staticModel = model.constructor as typeof Model;
  const fields = meta.fields.slice();
  const classRefs = storage.getModelClassReferences(staticModel);
  const refs = Object.assign({}, classRefs, meta.refs);

  const defaults = storage.getModelDefaults(staticModel);

  Object.keys(data).concat(Object.keys(defaults))
    .forEach((key) => {
      if (!(key in refs) && fields.indexOf(key) === -1) {
        fields.push(key);
      }
    });

  return {defaults, fields, refs};
}

function initModelData(model: Model, data: IRawModel, meta: IMetaToInit) {
  const {defaults, fields, refs} = prepareFields(data, meta, model);

  const staticModel = model.constructor as typeof Model;
  const modelId = storage.getModelClassMetaKey(staticModel, 'id');
  const modelType = storage.getModelClassMetaKey(staticModel, 'type');

  fields.forEach((key) => {
    let type = FieldType.DATA;
    let value = data[key] || defaults[key] || undefined;
    if (key === modelId) {
      type = FieldType.ID;
      value = meta.id;
    } else if (key === modelType) {
      type = FieldType.TYPE;
      value = meta.type;
    }
    initModelField(model, key, value, type);
  });

  Object.keys(refs).forEach((key) => {
    const opts = refs[key];
    initModelRef(model, key, opts, data[key] || defaults[key] || undefined);
  });
}

function initModelMeta(model: Model, data: IRawModel): IDictionary<any> & IMetaToInit {
  const staticModel = model.constructor as typeof Model;
  const modelId = storage.getModelClassMetaKey(staticModel, 'id');
  const modelType = storage.getModelClassMetaKey(staticModel, 'type');

  const meta = {
    fields: [],
    id: (modelId && data[modelId]) || staticModel.getAutoId(),
    refs: {},
    type: (modelType && data[modelType]) || getModelType(model),
  };

  let newMeta;
  const toInit: IMetaToInit = {fields: [], refs: {}};
  if (META_FIELD in data && data[META_FIELD]) {
    const oldMeta = data[META_FIELD] || {};
    if (oldMeta) {
      toInit.fields = oldMeta.fields;
      delete oldMeta.fields;
      toInit.refs = oldMeta.refs;
      delete oldMeta.refs;
    }
    newMeta = storage.setModelMeta(model, Object.assign(meta, oldMeta));
    delete data[META_FIELD];
  } else {
    newMeta = storage.setModelMeta(model, meta);
  }
  return Object.assign({}, newMeta, toInit);
}

export function initModel(model: Model, rawData: IRawModel) {
  const staticModel = model.constructor as typeof Model;
  const data = Object.assign({}, staticModel.preprocess(rawData));

  const meta = initModelMeta(model, data);

  const existingModel = storage.findModel(meta.type, meta.id);
  if (existingModel) {
    throw error(MODEL_EXISTS);
  }

  initModelData(model, data, meta);
}
