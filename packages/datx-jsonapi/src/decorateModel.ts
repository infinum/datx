import {Collection, Model} from 'datx';
import {IRawModel} from 'datx/dist/interfaces/IRawModel';

import {flattenModel} from './helpers/model';
import {IRecord} from './interfaces/JsonApi';

export function decorateModel(BaseClass: typeof Model) {

  class JsonapiModel extends BaseClass {
    constructor(rawData: IRawModel|IRecord = {}, collection?: Collection) {
      let data = rawData;
      if ('type' in rawData && ('attributes' in rawData || 'relationships' in rawData)) {
        data = flattenModel(rawData as IRecord);
      }
      super(data, collection);
    }
  }

  return JsonapiModel as typeof Model;
}
