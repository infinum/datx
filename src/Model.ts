import {toJS} from 'mobx';

import {Collection} from './Collection';
import {DEFAULT_TYPE, META_FIELD} from './consts';
import {MODEL_EXISTS} from './errors';
import {error} from './helpers/format';
import {getModelType, setInitial} from './helpers/model';
import {IDictionary} from './interfaces/IDictionary';
import {IRawModel} from './interfaces/IRawModel';
import {IType} from './interfaces/IType';
import {storage} from './services/storage';

export class Model {
  public static type: IType = DEFAULT_TYPE;
  public static autoIdValue: number = 0;

  public static preprocess(data: object) {
    return data;
  }

  public static getAutoId() {
    return --this.autoIdValue;
  }

  protected static __defaults: IDictionary<any> = {};

  constructor(rawData: IRawModel = {}) {
    const staticModel = this.constructor as typeof Model;
    const meta = {
      id: staticModel.getAutoId(),
      type: getModelType(this),
    };

    const data = Object.assign({}, staticModel.preprocess(rawData));

    if (META_FIELD in data && data[META_FIELD]) {
      storage.setModelMeta(this, Object.assign(meta, data[META_FIELD] || {}));
      delete data[META_FIELD];
    } else {
      storage.setModelMeta(this, meta);
    }
    const existingModel = storage.findModel(meta.type, meta.id);
    if (existingModel) {
      throw error(MODEL_EXISTS);
    }

    const defaults = storage.getModelDefaults(staticModel);
    Object.keys(defaults)
      .filter((key) => !(key in data))
      .forEach((key) => {
        setInitial(this, key, defaults[key]);
      });

    Object.keys(data)
      .forEach((key) => {
        setInitial(this, key, data[key]);
      });

    storage.registerModel(this);
  }

  public toJSON(): IRawModel {
    const data = toJS(storage.getModelData(this));
    const meta = toJS(storage.getModelMeta(this));
    return Object.assign(data, {[META_FIELD]: meta});
  }
}
