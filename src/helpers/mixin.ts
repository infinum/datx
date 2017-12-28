import {Collection} from '../Collection';
import {Model} from '../Model';

// tslint:disable-next-line:ban-types
function isOfType(obj: Function, type: Function): boolean {
  let model = obj;
  while (model) {
    if (model === type) {
      return true;
    }
    model = Object.getPrototypeOf(model);
  }
  return false;
}

export function isModel(obj: typeof Model | typeof Collection): boolean {
  return isOfType(obj, Model);
}

export function isCollection(obj: typeof Model | typeof Collection): boolean {
  return isOfType(obj, Collection);
}
