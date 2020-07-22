import { ReferenceType } from './enums/ReferenceType';
import { IIdentifier } from './interfaces/IIdentifier';
import { IModelConstructor } from './interfaces/IModelConstructor';
import { IType } from './interfaces/IType';
import { PureCollection } from './PureCollection';
import { PureModel } from './PureModel';
import { storage } from './services/storage';

function getClass<T extends PureModel>(obj: T): typeof PureModel {
  return (typeof obj === 'function' ? obj : obj.constructor) as typeof PureModel;
}

function prepareDecorator<T extends PureModel>(_obj: T, _key: string, opts?: object): void {
  if (opts && 'initializer' in opts) {
    opts['initializer'] = undefined;

    // Babel 7 + Decorators fix
    // Required to prevent the initializerDefineProperty call in babel-runtime
    // If initializer is undefined, the descriptor will be null and therefore
    // the initializerDefineProperty will be skipped

    // tslint:disable-next-line:max-line-length
    // https://github.com/babel/babel/blob/3aaafae053fa75febb3aa45d45b6f00646e30ba4/packages/babel-helpers/src/helpers.js#L1019
  }
}

/**
 * Set a model property as tracked
 *
 * @template T
 * @param {T} obj Target model
 * @param {string} key Property name
 * @returns {void}
 */
function propFn<T extends PureModel>(obj: T, key: string, opts?: object): void {
  prepareDecorator(obj, key, opts);
  storage.addModelDefaultField(getClass(obj), key);
}

export const prop = Object.assign(propFn, {
  /**
   * Set the default value for the model property
   *
   * @param {any} value The default property value
   * @returns {(obj: PureModel, key: string) => void}
   */
  defaultValue(value: any): (obj: PureModel, key: string) => void {
    return <T extends PureModel>(obj: T, key: string, opts?: object) => {
      prepareDecorator(obj, key, opts);
      storage.addModelDefaultField(getClass(obj), key, value);
    };
  },

  /**
   * Add a reference to a single other model
   *
   * @param {typeof PureModel} refModel Model type the reference will point to
   * @returns {(obj: PureModel, key: string) => void}
   */
  toOne(refModel: typeof PureModel|IType): (obj: PureModel, key: string) => void {
    return <T extends PureModel>(obj: T, key: string, opts?: object) => {
      prepareDecorator(obj, key, opts);
      storage.addModelClassReference(getClass(obj), key, {
        model: refModel,
        type: ReferenceType.TO_ONE,
      });
    };
  },

  /**
   * Add a reference to multiple other models
   *
   * @param {typeof PureModel} refModel Model type the reference will point to
   * @param {string} [property] Use a foreign key from the other model to get this reference (computed back reference)
   * @returns {(obj: PureModel, key: string) => void}
   */
  toMany(refModel: typeof PureModel|IType, property?: string): (obj: PureModel, key: string) => void {
    return <T extends PureModel>(obj: T, key: string, opts?: object) => {
      prepareDecorator(obj, key, opts);
      storage.addModelClassReference(getClass(obj), key, {
        model: refModel,
        property,
        type: ReferenceType.TO_MANY,
      });
    };
  },

  /**
   * Add a reference to a single or multiple other models
   *
   * @param {typeof PureModel} refModel Model type the reference will point to
   * @returns {(obj: PureModel, key: string) => void}
   */
  toOneOrMany(refModel: typeof PureModel|IType): (obj: PureModel, key: string) => void {
    return <T extends PureModel>(obj: T, key: string, opts?: object) => {
      prepareDecorator(obj, key, opts);
      storage.addModelClassReference(getClass(obj), key, {
        model: refModel,
        type: ReferenceType.TO_ONE_OR_MANY,
      });
    };
  },

  /**
   * Define the identifier property on the model
   *
   * @param {T} obj Target model
   * @param {string} key Identifier property name
   * @returns {void}
   */
  identifier<T extends PureModel>(obj: T, key: string, opts?: object): void {
    prepareDecorator(obj, key, opts);
    storage.addModelDefaultField(getClass(obj), key);
    storage.setModelClassMetaKey(getClass(obj), 'id', key);
  },

  /**
   * Define the type property on the model
   *
   * @param {T} obj Target model
   * @param {string} key Type property name
   * @returns {void}
   */
  type<T extends PureModel>(obj: T, key: string, opts?: object): void {
    prepareDecorator(obj, key, opts);
    storage.addModelDefaultField(getClass(obj), key);
    storage.setModelClassMetaKey(getClass(obj), 'type', key);
  },

  /**
   *  Define the field alias property on the model
   * @param refKey {string | Array<string>}
   */
  alias(refKey: string | Array<string>): (obj: PureModel, key: string) => void {
    return <T extends PureModel>(obj: T, key: string, opts?: object) => {
      prepareDecorator(obj, key, opts);
      storage.addModelDefaultField(getClass(obj), key);
      storage.addModelClassFieldAlias(getClass(obj), key, refKey);
    };
  },
});

export function view<TCollection extends PureCollection, TModel extends PureModel>(
  modelType: IModelConstructor<TModel>|IType,
  options: {
    sortMethod?: string|((item: TModel) => any);
    models?: Array<IIdentifier|TModel>;
    unique?: boolean;
    mixins?: Array<(view: any) => any>;
  } = { },
) {
  return (obj: TCollection, key: string, opts?: object): void => {
    prepareDecorator(obj, key, opts);
    if (!Object.hasOwnProperty.call(obj.constructor, 'views')) {
      obj.constructor['views'] = { };
    }
    obj.constructor['views'][key] = {
      modelType,
      ...options,
    };
  };
}
