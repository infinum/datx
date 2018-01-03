import {computed} from 'mobx';

import {DECORATE_MODEL} from '../errors';
import {error} from '../helpers/format';
import {isModel} from '../helpers/mixin';
import {getModelCollections, getModelId, getModelType, getOriginalModel} from '../helpers/model/utils';
import {IDictionary} from '../interfaces/IDictionary';
import {IModelConstructor} from '../interfaces/IModelConstructor';
import {IReferenceOptions} from '../interfaces/IReferenceOptions';
import {IType} from '../interfaces/IType';
import {Model} from '../Model';
import {storage} from '../services/storage';

export function setupModel<T extends Model>(
  Base: IModelConstructor<T>,
  {
    fields,
    references,
    type,
    idAttribute,
    typeAttribute,
  }: {
    fields?: IDictionary<any>;
    references?: IDictionary<IReferenceOptions>;
    type?: IType;
    idAttribute?: string;
    typeAttribute?: string;
  },
) {
  const BaseClass = Base as typeof Model;

  if (!isModel(BaseClass)) {
    throw error(DECORATE_MODEL);
  }

  class ModelWithProps extends BaseClass {}

  if (type) {
    ModelWithProps.type = type;
  }

  if (idAttribute) {
    storage.addModelDefaultField(ModelWithProps, idAttribute);
    storage.setModelClassMetaKey(ModelWithProps, 'id', idAttribute);
  }

  if (typeAttribute) {
    storage.addModelDefaultField(ModelWithProps, typeAttribute);
    storage.setModelClassMetaKey(ModelWithProps, 'type', typeAttribute);
  }

  if (fields) {
    Object.keys(fields).forEach((key) => {
      storage.addModelDefaultField(ModelWithProps, key, fields[key]);
    });
  }

  if (references) {
    Object.keys(references).forEach((key) => {
      storage.addModelClassReference(ModelWithProps, key, references[key]);
    });
  }

  return ModelWithProps as IModelConstructor<T>;
}
