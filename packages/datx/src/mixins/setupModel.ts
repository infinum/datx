import { IDictionary } from 'datx-utils';

import { ReferenceType } from '../enums/ReferenceType';
import { DECORATE_MODEL } from '../errors';
import { error } from '../helpers/format';
import { isModel } from '../helpers/mixin';
import { IModelConstructor } from '../interfaces/IModelConstructor';
import { IReferenceOptions } from '../interfaces/IReferenceOptions';
import { IType } from '../interfaces/IType';
import prop from '../prop';
import { PureModel } from '../PureModel';

export function setupModel<IModel extends PureModel, IFields extends IDictionary>(
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
  // tslint:disable-next-line:no-object-literal-type-assertion
  } = { fields: { } as IFields },
) {
  const BaseClass = Base as typeof PureModel;

  if (!isModel(BaseClass)) {
    throw error(DECORATE_MODEL);
  }

  class ModelWithProps extends BaseClass { }

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
      const { model, property } = references[key];
      switch (references[key].type) {
        case ReferenceType.TO_ONE:
          prop.toOne(model)(ModelWithProps.prototype, key);

          return;
        case ReferenceType.TO_MANY:
          prop.toMany(model, property)(ModelWithProps.prototype, key);

          return;
        default:
          prop.toOneOrMany(model)(ModelWithProps.prototype, key);

          return;
      }
    });
  }

  return ModelWithProps as IModelConstructor<IModel & IFields>;
}
