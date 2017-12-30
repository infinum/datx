import {toJS} from 'mobx';

import {Collection} from '../../Collection';
import {META_FIELD} from '../../consts';
import {NO_REFS, NOT_A_CLONE, REF_NEEDS_INIT} from '../../errors';
import {IDictionary} from '../../interfaces/IDictionary';
import {IIdentifier} from '../../interfaces/IIdentifier';
import {IRawModel} from '../../interfaces/IRawModel';
import {IReferenceOptions} from '../../interfaces/IReferenceOptions';
import {IType} from '../../interfaces/IType';
import {TRefValue} from '../../interfaces/TRefValue';
import {Model} from '../../Model';
import {storage} from '../../services/storage';
import {error} from '../format';
import {initModelField} from '../model/init';

export function getModelType(model: IType|typeof Model|Model): IType {
  if (typeof model === 'function') {
    return model.type;
  } else if (typeof model === 'object') {
    return storage.getModelDataKey(model, 'type') || (model.constructor as typeof Model).type;
  }
  return model;
}

export function getModelId(model: Model|IIdentifier): IIdentifier {
  if (model instanceof Model) {
    return storage.getModelMetaKey(model, 'id');
  }
  return model;
}

export function getModelCollections(model: Model): Array<Collection> {
  return storage.getModelCollections(model);
}

export function cloneModel<T extends Model>(model: T): T {
  const TypeModel = model.constructor as typeof Model;
  const rawData = modelToJSON(model);
  if (rawData[META_FIELD] && typeof rawData[META_FIELD] === 'object' && rawData[META_FIELD] !== undefined) {
    const meta = (rawData[META_FIELD] as IDictionary<any>);
    meta.originalId = meta.id;
    delete meta.id;
  }

  // TODO: Warning if model is not in a collection

  return new TypeModel(rawData) as T;
}

export function getOriginalModel(model: Model) {
  const originalId = storage.getModelMetaKey(model, 'originalId');
  if (originalId) {
    return storage.findModel(model, originalId);
  }
  throw error(NOT_A_CLONE);
}

export function updateModel<T extends Model>(model: T, data: IDictionary<any>): T {
  Object.keys(data).forEach((key) => {
    if (key !== META_FIELD) {
      assignModel(model, key, data[key]);
    }
  });
  return model;
}

export function assignModel<T extends Model>(model: T, key: string, value: any): void {
  const refs = storage.getModelMetaKey(model, 'refs') as IDictionary<IReferenceOptions>;
  if (key in refs) {
    assignModelRef(model, key, value);
  } else if (value instanceof Model) {
    throw error(NO_REFS, {key});
  } else {
    assignModelField(model, key, value);
  }
}

function assignModelField<T extends Model>(model: T, key: string, value: any): void {
  const fields = storage.getModelMetaKey(model, 'fields') as Array<string>;
  if (fields.indexOf(key) !== -1) {
    model[key] = value;
  } else {
    initModelField(model, key, value);
  }
}

function assignModelRef<T extends Model>(model: T, key: string, value: TRefValue): void {
  const refs = storage.getModelMetaKey(model, 'refs');
  if (key in refs) {
    model[key] = value;
  } else {
    throw error(REF_NEEDS_INIT, {key});
  }
}

export function getMetaKeyFromRaw(data: IRawModel, key: string): any {
  if (META_FIELD in data && typeof data[META_FIELD] === 'object' && data[META_FIELD] !== undefined) {
    return (data[META_FIELD] as IDictionary<any>)[key];
  }
  return undefined;
}

export function modelToJSON(model: Model): IRawModel {
  const data = toJS(storage.getModelData(model));
  const meta = toJS(storage.getModelMeta(model));
  return Object.assign(data, {[META_FIELD]: meta});
}
