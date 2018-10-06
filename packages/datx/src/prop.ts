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
 * @returns {void}
 */
function propFn<T extends PureModel>(obj: T, key: string): void {
  storage.addModelDefaultField(obj.constructor as typeof PureModel, key);
}

// tslint:disable-next-line:no-default-export
export default Object.assign(propFn, {
  /**
   * Set the default value for the model property
   *
   * @param {any} value The default property value
   * @returns {(obj: PureModel, key: string) => void}
   */
  defaultValue(value: any): (obj: PureModel, key: string) => void {
    return <T extends PureModel>(obj: T, key: string) => {
      storage.addModelDefaultField(obj.constructor as typeof PureModel, key, value);
    };
  },

  /**
   * Add a reference to a single other model
   *
   * @param {typeof PureModel} refModel Model type the reference will point to
   * @returns {(obj: PureModel, key: string) => void}
   */
  toOne(refModel: typeof PureModel|IType): (obj: PureModel, key: string) => void {
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
   * @returns {(obj: PureModel, key: string) => void}
   */
  toMany(refModel: typeof PureModel|IType, property?: string): (obj: PureModel, key: string) => void {
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
   * @returns {(obj: PureModel, key: string) => void}
   */
  toOneOrMany(refModel: typeof PureModel|IType): (obj: PureModel, key: string) => void {
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
   * @returns {void}
   */
  identifier<T extends PureModel>(obj: T, key: string): void {
    storage.addModelDefaultField(obj.constructor as typeof PureModel, key);
    storage.setModelClassMetaKey(obj.constructor as typeof PureModel, 'id', key);
  },

  /**
   * Define the type property on the model
   *
   * @param {T} obj Target model
   * @param {string} key Type property name
   * @returns {void}
   */
  type<T extends PureModel>(obj: T, key: string): void {
    storage.addModelDefaultField(obj.constructor as typeof PureModel, key);
    storage.setModelClassMetaKey(obj.constructor as typeof PureModel, 'type', key);
  },
});
