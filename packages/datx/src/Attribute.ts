import { getMeta, setMeta, deprecated } from 'datx-utils';

import { PureModel } from './PureModel';
import { IType } from './interfaces/IType';
import { MetaClassField } from './enums/MetaClassField';
import { ReferenceType } from './enums/ReferenceType';
import { getModelType } from './helpers/model/utils';
import { IModelConstructor } from './interfaces/IModelConstructor';
import { IIdentifier } from './interfaces/IIdentifier';
import { PureCollection } from './PureCollection';

export function getClass<T extends PureModel>(obj: T): typeof PureModel {
  return (typeof obj === 'function' ? obj : obj.constructor) as typeof PureModel;
}

function prepareDecorator<T extends PureModel>(_obj: T, _key: string, opts?: object): void {
  if (opts && 'initializer' in opts) {
    // eslint-disable-next-line no-param-reassign
    opts['initializer'] = undefined;

    // Babel 7 + Decorators fix
    // Required to prevent the initializerDefineProperty call in babel-runtime
    // If initializer is undefined, the descriptor will be null and therefore
    // the initializerDefineProperty will be skipped

    // eslint-disable-next-line max-len
    // https://github.com/babel/babel/blob/3aaafae053fa75febb3aa45d45b6f00646e30ba4/packages/babel-helpers/src/helpers.js#L1019
  }
}

type RefModel = PureModel | IType;

interface IAttributeFieldOptions {
  defaultValue?: any;
  isIdentifier?: true;
  isType?: true;
}

interface IAttributeNoReference {
  toOne?: undefined;
  toOneOrMany?: undefined;
  toMany?: undefined;
  referenceProperty?: undefined;
}

interface IAttributeToOne {
  toOne: RefModel;
  toOneOrMany?: undefined;
  toMany?: undefined;
  referenceProperty?: undefined;
}

interface IAttributeToOneOrMany {
  toOne?: undefined;
  toOneOrMany: RefModel;
  toMany?: undefined;
  referenceProperty?: undefined;
}

interface IAttributeToMany {
  toOne?: undefined;
  toOneOrMany?: undefined;
  toMany: RefModel;
  referenceProperty?: string;
}

type IAttributeOptions = IAttributeFieldOptions &
  (IAttributeNoReference | IAttributeToOne | IAttributeToOneOrMany | IAttributeToMany);

export interface IReferenceDefinition {
  type: ReferenceType;
  model: IType;
  property?: string;
}

export interface IFieldDefinition {
  referenceDef: IReferenceDefinition | false;
  defaultValue?: any;
}

function getReferenceDef(
  toOne?: RefModel,
  toOneOrMany?: RefModel,
  toMany?: RefModel,
  referenceProperty?: string,
): IReferenceDefinition | false {
  if (toOne) {
    return {
      type: ReferenceType.TO_ONE,
      model: getModelType(toOne),
    };
  }

  if (toOneOrMany) {
    return {
      type: ReferenceType.TO_ONE_OR_MANY,
      model: getModelType(toOneOrMany),
    };
  }

  if (toMany) {
    return {
      type: ReferenceType.TO_MANY,
      model: getModelType(toMany),
      property: referenceProperty,
    };
  }

  return false;
}

/**
 * Set a model attribute as tracked
 */
export function Attribute<T extends PureModel>({
  defaultValue,
  isIdentifier,
  isType,
  toOne,
  toOneOrMany,
  toMany,
  referenceProperty,
}: IAttributeOptions = {}) {
  return (obj: T, key: string, opts?: object): void => {
    prepareDecorator(obj, key, opts);
    const modelClass = getClass(obj);

    const modelClassFields = getMeta<Record<string, IFieldDefinition>>(
      modelClass,
      MetaClassField.Fields,
      {},
    );

    modelClassFields[key] = {
      referenceDef: getReferenceDef(toOne, toOneOrMany, toMany, referenceProperty),
      defaultValue,
    };
    setMeta(modelClass, MetaClassField.Fields, modelClassFields);

    if (isIdentifier) {
      setMeta(modelClass, MetaClassField.IdField, key);
    }

    if (isType) {
      setMeta(modelClass, MetaClassField.TypeField, key);
    }
  };
}

export function ViewAttribute<TCollection extends PureCollection, TModel extends PureModel>(
  modelType: IModelConstructor<TModel> | IType,
  options: {
    sortMethod?: string | ((item: TModel) => any);
    models?: Array<IIdentifier | TModel>;
    unique?: boolean;
    mixins?: Array<(view: any) => any>;
  } = {},
) {
  return (obj: TCollection, key: string, opts?: object): void => {
    prepareDecorator(obj, key, opts);
    if (!Object.hasOwnProperty.call(obj.constructor, 'views')) {
      // eslint-disable-next-line no-param-reassign
      obj.constructor['views'] = {};
    }
    // eslint-disable-next-line no-param-reassign
    obj.constructor['views'][key] = {
      modelType,
      ...options,
    };
  };
}

// Compatibility implementation
function propFn<T extends PureModel>(obj: T, key: string, opts?: object) {
  deprecated('@prop was deprecated, use @Attribute instead');
  Attribute()(obj, key, opts);
}

export const prop = Object.assign(propFn, {
  defaultValue(value: any) {
    deprecated('@prop was deprecated, use @Attribute instead');
    return Attribute({ defaultValue: value });
  },

  toOne(refModel: typeof PureModel | IType) {
    deprecated('@prop was deprecated, use @Attribute instead');
    return Attribute({ toOne: refModel });
  },

  toMany(refModel: typeof PureModel | IType, property?: string) {
    deprecated('@prop was deprecated, use @Attribute instead');
    return Attribute({ toMany: refModel, referenceProperty: property });
  },

  toOneOrMany(refModel: typeof PureModel | IType) {
    deprecated('@prop was deprecated, use @Attribute instead');
    return Attribute({ toOneOrMany: refModel });
  },

  identifier: Attribute({ isIdentifier: true }),

  type: Attribute({ isType: true }),
});

export const view = ViewAttribute;
