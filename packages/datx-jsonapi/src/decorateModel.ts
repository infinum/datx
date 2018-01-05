import {Model} from 'datx';

export function decorateModel(BaseClass: typeof Model) {
  return BaseClass;
}
