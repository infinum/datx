import {ReferenceType} from './enums/ReferenceType';
import {IProp} from './interfaces/IProp';
import {Model} from './Model';
import {storage} from './services/storage';

/**
 * Set a model property as tracked
 *
 * @template T
 * @param {T} obj Target model
 * @param {string} key Property name
 * @returns {undefined}
 */
function propFn<T extends Model>(obj: T, key: string) {
  storage.addModelDefaultField(obj.constructor as typeof Model, key);
}

export default Object.assign(propFn, {

  /**
   * Set the default value for the model property
   *
   * @param {any} value The default property value
   * @returns {undefined}
   */
  defaultValue(value: any) {
    return <T extends Model>(obj: T, key: string) => {
      storage.addModelDefaultField(obj.constructor as typeof Model, key, value);
    };
  },

  /**
   * Add a reference to a single other model
   *
   * @param {typeof Model} refModel Model type the reference will point to
   * @returns {undefined}
   */
  toOne(refModel: typeof Model) {
    return <T extends Model>(obj: T, key: string) => {
      storage.addModelClassReference(obj.constructor as typeof Model, key, {
        model: refModel,
        type: ReferenceType.TO_ONE,
      });
    };
  },

  /**
   * Add a reference to multiple other models
   *
   * @param {typeof Model} refModel Model type the reference will point to
   * @param {string} [property] Use a foreign key from the other model to get this reference (computed back reference)
   * @returns {undefined}
   */
  toMany(refModel: typeof Model, property?: string) {
    return <T extends Model>(obj: T, key: string) => {
      storage.addModelClassReference(obj.constructor as typeof Model, key, {
        model: refModel,
        property,
        type: ReferenceType.TO_MANY,
      });
    };
  },

  /**
   * Add a reference to a single or multiple other models
   *
   * @param {typeof Model} refModel Model type the reference will point to
   * @returns {undefined}
   */
  toOneOrMany(refModel: typeof Model) {
    return <T extends Model>(obj: T, key: string) => {
      storage.addModelClassReference(obj.constructor as typeof Model, key, {
        model: refModel,
        type: ReferenceType.TO_ANY,
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
  identifier<T extends Model>(obj: T, key: string) {
    storage.addModelDefaultField(obj.constructor as typeof Model, key);
    storage.setModelClassMetaKey(obj.constructor as typeof Model, 'id', key);
  },

  /**
   * Define the type property on the model
   *
   * @param {T} obj Target model
   * @param {string} key Type property name
   * @returns {undefined}
   */
  type<T extends Model>(obj: T, key: string) {
    storage.addModelDefaultField(obj.constructor as typeof Model, key);
    storage.setModelClassMetaKey(obj.constructor as typeof Model, 'type', key);
  },
});
