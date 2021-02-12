import { ICollectionConstructor } from '../interfaces/ICollectionConstructor';
import { IModelConstructor } from '../interfaces/IModelConstructor';
import { IViewConstructor } from '../interfaces/IViewConstructor';
import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';
import { View } from '../View';

/**
 * Check if a class is of a certain type
 *
 * @export
 * @param {Function} obj Class to check
 * @param {Function} type Type to check
 * @returns {boolean} Class is of the given type
 */
function isOfType<T>(obj: unknown, type: T): obj is T {
  let model = obj;

  while (model) {
    if (model === type) {
      return true;
    }
    model = Object.getPrototypeOf(model);
  }

  return false;
}

/**
 * Check if a class is a model
 *
 * @export
 * @param {unknown} obj Class to check
 * @returns {boolean} Class is a model
 */
export function isModel(obj: typeof PureModel | IModelConstructor<unknown>): true;
export function isModel(obj: unknown): false;
export function isModel(obj: unknown): boolean {
  return isOfType(obj, PureModel);
}

/**
 * Check if a class is a collection
 *
 * @export
 * @param {unknown} obj Class to check
 * @returns {boolean} Class is a collection
 */
export function isCollection(obj: typeof PureCollection | ICollectionConstructor<unknown>): true;
export function isCollection(obj: unknown): false;
export function isCollection(obj: unknown): boolean {
  return isOfType(obj, PureCollection);
}

/**
 * Check if a class is a collection
 *
 * @export
 * @param {unknown} obj Class to check
 * @returns {boolean} Class is a collection
 */
export function isView(obj: typeof View | IViewConstructor<unknown, unknown>): true;
export function isView(obj: unknown): false;
export function isView(obj: unknown): boolean {
  return isOfType(obj, View);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function mixinBuilder<TModel extends PureModel, TExtendedModel, TCollection extends PureCollection, TExtendedCollection, TView extends View, TExtendedView>(
  modelBuilder?: (BaseClass: IModelConstructor<TModel>) => IModelConstructor<TModel, TExtendedModel>,
  collectionBuilder?: (BaseClass: ICollectionConstructor<TCollection>) => ICollectionConstructor<TCollection, TExtendedCollection>,
  viewBuilder?: (BaseClass: IViewConstructor<TModel, TView>) => IViewConstructor<TModel, TView, TExtendedView>,
) {

  function decorate(BaseClass: IModelConstructor<TModel>): IModelConstructor<TModel, TExtendedModel>;
  function decorate(BaseClass: ICollectionConstructor<TCollection>): ICollectionConstructor<TCollection, TExtendedCollection>;
  function decorate(BaseClass: IViewConstructor<TModel, TView>): IViewConstructor<TModel, TView, TExtendedView>;
  function decorate(BaseClass) {
    if (isModel(BaseClass)) {
      if (modelBuilder) {
        return modelBuilder(BaseClass);
      } else {
        throw new Error('The instance can\'t be a model');
      }
    } else if (isCollection(BaseClass)) {
      if (collectionBuilder) {
        return collectionBuilder(BaseClass);
      } else {
        throw new Error('The instance can\'t be a collection');
      }
    } else if (isView(BaseClass)) {
      if (viewBuilder) {
        return viewBuilder(BaseClass);
      } else {
        throw new Error('The instance can\'t be a view');
      }
    }

    throw new Error('The instance needs to be a model, collection or a view');
  }

  return decorate;
}
