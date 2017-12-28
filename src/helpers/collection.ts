import {Collection} from '../Collection';
import {OBJECT_NO_TYPE, UNDEFINED_MODEL} from '../errors';
import {error} from '../helpers/format';
import {IRawModel} from '../interfaces/IRawModel';
import {Model} from '../Model';

export function initCollectionModel(collection: Collection, item: IRawModel, index: number): Model {
  if ('__META__' in item && item.__META__ && 'type' in item.__META__) {
    const type = item.__META__.type;
    const TypeModel = (collection.constructor as typeof Collection).types
      .find((model) => model.type === type);
    if (!TypeModel) {
      throw error(UNDEFINED_MODEL);
    }
    return new TypeModel(item);
  }
  throw error(OBJECT_NO_TYPE, {index});
}
