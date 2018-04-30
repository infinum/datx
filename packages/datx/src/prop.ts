import {ReferenceType} from './enums/ReferenceType';
import {IType} from './interfaces/IType';
import {PureModel} from './PureModel';
import {storage} from './services/storage';

/**
 * Set a model property as tracked
 *
 * @template T
 * @param {T} obj Target model
 * @param {string} key Property name
 * @returns {undefined}
 */
function propFn<T extends PureModel>(obj: T, key: string) {
  storage.addModelDefaultField(obj.constructor as typeof PureModel, key);
}

// tslint:disable-next-line:no-default-export
export default Object.assign(propFn, {
  /**
   * Set the default value for the model property
   *
   * @param {any} value The default property value
   * @returns {undefined}
   */
  defaultValue(value: any) {
    return <T extends PureModel>(obj: T, key: string) => {
      storage.addModelDefaultField(obj.constructor as typeof PureModel, key, value);
    };
  },

  /**
   * Add a reference to a single other model
   *
   * @param {typeof PureModel} refModel Model type the reference will point to
   * @returns {undefined}
   */
  toOne(refModel: typeof PureModel|IType) {
    return <T extends PureModel>(obj: T, key: string) => {
      storage.addModelClassReference(obj.constructor as typeof PureModel, key, {
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
   * @returns {undefined}
   */
  toMany(refModel: typeof PureModel|IType, property?: string) {
    return <T extends PureModel>(obj: T, key: string) => {
      storage.addModelClassReference(obj.constructor as typeof PureModel, key, {
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
   * @returns {undefined}
   */
  toOneOrMany(refModel: typeof PureModel|IType) {
    return <T extends PureModel>(obj: T, key: string) => {
      storage.addModelClassReference(obj.constructor as typeof PureModel, key, {
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
   * @returns {undefined}
   */
  identifier<T extends PureModel>(obj: T, key: string) {
    storage.addModelDefaultField(obj.constructor as typeof PureModel, key);
    storage.setModelClassMetaKey(obj.constructor as typeof PureModel, 'id', key);
  },

  /**
   * Define the type property on the model
   *
   * @param {T} obj Target model
   * @param {string} key Type property name
   * @returns {undefined}
   */
  type<T extends PureModel>(obj: T, key: string) {
    storage.addModelDefaultField(obj.constructor as typeof PureModel, key);
    storage.setModelClassMetaKey(obj.constructor as typeof PureModel, 'type', key);
  },
});
