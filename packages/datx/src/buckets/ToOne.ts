import { error } from '../helpers/format';
import { getModelRef, isModelReference } from '../helpers/model/utils';
import { updateSingleAction } from '../helpers/patch';
import { IModelRef } from '../interfaces/IModelRef';
import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';

export class ToOne<T extends PureModel> {
  private __rawValue: T | IModelRef | null = null;

  constructor(
    data: T | IModelRef | null,
    protected __collection?: PureCollection,
    protected __readonly: boolean = false,
    protected __model?: PureModel,
    protected __key?: string,
    protected __skipMissing = true,
  ) {
    if (data && !this.__collection) {
      throw error('The model needs to be in a collection to be referenceable');
    } else if (Array.isArray(data)) {
      throw error("The reference can't be an array of values.");
    } else if (!isModelReference(data) && !(data instanceof PureModel) && data !== null) {
      throw error('The value needs to be a reference');
    }

    this.__rawValue = data;
  }

  public setCollection(value: PureCollection | undefined): void {
    this.__collection = value;
  }

  public get value(): T | null {
    return this.__rawValue ? this.__getModel(this.__rawValue) : null;
  }

  public set value(data: T | null) {
    if (!this.__collection) {
      throw error('The model needs to be in a collection to be referenceable');
    } else if (this.__readonly) {
      throw error('This is a read-only bucket');
    } else if (Array.isArray(data)) {
      throw error("The reference can't be an array of values.");
    } else if (!isModelReference(data) && !(data instanceof PureModel) && data !== null) {
      throw error('The value needs to be a reference');
    }
    this.__rawValue = data;
    if (this.__model && this.__key) {
      updateSingleAction(this.__model, this.__key, data);
    }
  }

  public get refValue(): IModelRef | null {
    return this.__rawValue ? getModelRef(this.__rawValue) : null;
  }

  public toJSON(): IModelRef | null {
    return this.refValue;
  }

  public get snapshot(): IModelRef | null {
    return this.toJSON();
  }

  protected __getModel(model: T | IModelRef | null): T | null {
    if (model instanceof PureModel || model === null) {
      return model;
    }

    if (!this.__collection) {
      throw error('The model needs to be in a collection to be referenceable');
    }

    const item = this.__collection.findOne<T>(model.type, model.id);

    if (item) {
      return item;
    }

    if (!this.__skipMissing) {
      return model as any;
    }
    return null;
  }
}
