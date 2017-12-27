import {toJS} from 'mobx';

import {DEFAULT_TYPE} from './consts';
import {setInitial} from './helpers/model';
import {IDictionary} from './interfaces/IDictionary';
import {IType} from './interfaces/IType';
import {storage} from './services/storage';

export class Model {
  public static type: IType = DEFAULT_TYPE;

  public static preprocessor(data: object) {
    return data;
  }

  protected static __defaults: IDictionary<any> = {};

  constructor(data = {}) {
    const defaults = storage.getModelDefaults(this.constructor as typeof Model);
    Object.keys(defaults).forEach((key) => {
      setInitial(this, key, defaults[key]);
    });
    Object.keys(data).forEach((key) => {
      setInitial(this, key, data[key]);
    });
  }

  public toJSON(): IDictionary<any> {
    return toJS(storage.getModelData(this));
  }
}
