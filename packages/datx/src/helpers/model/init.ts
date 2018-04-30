import {assignComputed, IDictionary, IRawModel, META_FIELD} from 'datx-utils';
import {computed, decorate, extendObservable, IObservableObject, isObservable, set} from 'mobx';

import {FieldType} from '../../enums/FieldType';
import {ReferenceType} from '../../enums/ReferenceType';
import {ID_REQUIRED, MODEL_EXISTS} from '../../errors';
import {IIdentifier} from '../../interfaces/IIdentifier';
import {IReferenceOptions} from '../../interfaces/IReferenceOptions';
import {IType} from '../../interfaces/IType';
import {TRefValue} from '../../interfaces/TRefValue';
import {PureCollection} from '../../PureCollection';
import {PureModel} from '../../PureModel';
import {storage} from '../../services/storage';
import {error} from '../format';
import {getField, getRef, updateField, updateRef} from './fields';
import {getModelMetaKey, getModelType, setModelMetaKey} from './utils';

interface IMetaToInit extends IDictionary<any> {
  fields: Array<string>;
  id?: IIdentifier;
  refs: IDictionary<IReferenceOptions>;
  type?: IType;
}

export function initModelField<T extends PureModel>(
  obj: T,
  key: string,
  defValue: any,
  type: FieldType = FieldType.DATA,
) {
  const fields = getModelMetaKey(obj, 'fields') as Array<string>;

  // Initialize the observable field to the default value
  storage.setModelDataKey(obj, key, defValue);
  if (fields.indexOf(key) === -1) {
    fields.push(key);
  }

  assignComputed(obj, key, () => getField(obj, key), (value) => updateField(obj, key, value, type));
}

/**
 * Initialize a reference to other models
 *
 * @export
 * @param {PureModel} obj Model to which the reference should be added
 * @param {string} key Model property where the reference will be defined
 * @param {IReferenceOptions} options Reference options
 * @param {TRefValue} initialVal Initial reference value
 */
export function initModelRef(obj: PureModel, key: string, options: IReferenceOptions, initialVal: TRefValue) {
  const refs = getModelMetaKey(obj, 'refs');

  // Initialize the observable field to the given value
  refs[key] = options;

  const isArray = options.type === ReferenceType.TO_MANY;
  storage.setModelDataKey(obj, key, isArray ? [] : undefined);

  assignComputed(obj, key, () => getRef(obj, key), (value) => updateRef(obj, key, value));

  if (!options.property) {
    obj[key] = initialVal;
  }
}

function prepareFields(data: IRawModel, meta: IMetaToInit, model: PureModel) {
  const staticModel = model.constructor as typeof PureModel;
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

function initModelData(model: PureModel, data: IRawModel, meta: IMetaToInit, collection?: PureCollection) {
  const {defaults, fields, refs} = prepareFields(data, meta, model);

  const staticModel = model.constructor as typeof PureModel;
  const modelId = storage.getModelClassMetaKey(staticModel, 'id');
  const modelType = storage.getModelClassMetaKey(staticModel, 'type');

  fields.forEach((key) => {
    let type = FieldType.DATA;
    let value = data[key];
    if (value === undefined) {
      value = defaults[key];
    }
    if (key === (modelId || 'id')) {
      type = FieldType.ID;
      value = meta.id;
    } else if (key === modelType) {
      type = FieldType.TYPE;
      value = meta.type;
    }
    initModelField(model, key, value, type);
  });

  if (modelId && !(modelId in fields)) {
    initModelField(model, modelId, meta.id, FieldType.ID);
  }

  Object.keys(refs).forEach((key) => {
    const opts = refs[key];
    const value = data[key] || defaults[key] || undefined;
    const models: any = collection ? collection.add(value, getModelType(opts.model)) : value;
    initModelRef(model, key, opts, models);
  });
}

function initModelMeta(model: PureModel, data: IRawModel, collection?: PureCollection): IDictionary<any> & IMetaToInit {
  const staticModel = model.constructor as typeof PureModel;
  const modelId = storage.getModelClassMetaKey(staticModel, 'id') || 'id';
  const modelType = storage.getModelClassMetaKey(staticModel, 'type');

  const type = (modelType && data[modelType]) || getModelType(model);
  let id = (modelId && data[modelId]);

  if (!id) {
    if (!staticModel.enableAutoId) {
      throw new Error(ID_REQUIRED);
    }
    id = staticModel.getAutoId();
    while (collection && collection.find(type, id)) {
      id = staticModel.getAutoId();
    }
  }

  const meta = {
    fields: [],
    id,
    refs: {},
    type,
  };

  let newMeta;
  const toInit: IMetaToInit = {fields: [], refs: {}};
  if (META_FIELD in data && data[META_FIELD]) {
    const oldMeta = data[META_FIELD] as IDictionary<any>;
    toInit.fields = oldMeta.fields;
    delete oldMeta.fields;
    toInit.refs = oldMeta.refs;
    delete oldMeta.refs;

    newMeta = storage.setModelMeta(model, Object.assign(meta, oldMeta));
    delete data[META_FIELD];
  } else {
    newMeta = storage.setModelMeta(model, meta);
  }

  return Object.assign({}, newMeta, toInit);
}

export function initModel(model: PureModel, rawData: IRawModel, collection?: PureCollection) {
  const staticModel = model.constructor as typeof PureModel;
  const data = Object.assign({}, staticModel.preprocess(rawData, collection));
  setModelMetaKey(model, 'collection', collection);
  const meta = initModelMeta(model, data, collection);
  initModelData(model, data, meta, collection);
}
