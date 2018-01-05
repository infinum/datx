import {ReferenceType} from '../enums/ReferenceType';
import {DECORATE_MODEL} from '../errors';
import {error} from '../helpers/format';
import {isModel} from '../helpers/mixin';
import {IDictionary} from '../interfaces/IDictionary';
import {IModelConstructor} from '../interfaces/IModelConstructor';
import {IReferenceOptions} from '../interfaces/IReferenceOptions';
import {IType} from '../interfaces/IType';
import {Model} from '../Model';
import prop from '../prop';

export function setupModel<IModel extends Model, IFields extends IDictionary<any>>(
  Base: IModelConstructor<IModel>,
  {
    fields,
    references,
    type,
    idAttribute,
    typeAttribute,
  }: {
    fields: IFields;
    references?: IDictionary<IReferenceOptions>;
    type?: IType;
    idAttribute?: string;
    typeAttribute?: string;
  } = {fields: {} as IFields},
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
    prop.identifier(ModelWithProps.prototype, idAttribute);
  }

  if (typeAttribute) {
    prop.type(ModelWithProps.prototype, typeAttribute);
  }

  if (fields) {
    Object.keys(fields).forEach((key) => {
      prop.defaultValue(fields[key])(ModelWithProps.prototype, key);
    });
  }

  if (references) {
    Object.keys(references).forEach((key) => {
      const {model, property} = references[key];
      switch (references[key].type) {
        case ReferenceType.TO_ONE:
          return prop.toOne(model)(ModelWithProps.prototype, key);
        case ReferenceType.TO_MANY:
          return prop.toMany(model, property)(ModelWithProps.prototype, key);
        default:
          return prop.toOneOrMany(model)(ModelWithProps.prototype, key);
      }
    });
  }

  return ModelWithProps as IModelConstructor<IModel & IFields>;
}
