import { replaceInArray } from '@datx/utils';

import { error } from '../helpers/format';
import { getModelCollection, getModelRef, isReference } from '../helpers/model/utils';
import { IModelRef } from '../interfaces/IModelRef';
import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';
import { updateSingleAction } from '../helpers/patch';

export class ToMany<T extends PureModel> {
  protected readonly __rawList: Array<T | IModelRef> = [];

  protected __collection?: PureCollection;

  constructor(
    data: Array<IModelRef | T> = [],
    collection?: PureCollection,
    protected __readonly: boolean = false,
    protected __model?: PureModel,
    protected __key?: string,
    protected __skipMissing = true,
  ) {
    if (data?.length > 0 && !collection) {
      throw error('The model needs to be in a collection to be referenceable');
    } else if (data && !Array.isArray(data)) {
      throw error('The reference must be an array of values.');
    }

    replaceInArray(this.__rawList, data || []);
    this.setCollection(collection);
  }

  public setCollection(collection: PureCollection | undefined): void {
    this.__collection = collection;

    if (collection) {
      this.__rawList.forEach((item, index) => {
        const model = this.__getModel(item);

        if (model) {
          this.__rawList[index] = model;
        }
      });
    }
  }

  public get value(): Array<T> {
    return this.__getList();
  }

  public set value(data: Array<T>) {
    if (this.__readonly) {
      throw error('This is a read-only bucket');
    } else if (data === null) {
      data = [];
    } else if (!Array.isArray(data)) {
      throw error('The reference must be an array of values.');
    }

    replaceInArray(this.__rawList, data);
    if (this.__model && this.__key) {
      updateSingleAction(this.__model, this.__key, data);
    }
    this.__reMap(); // TODO: Should this be called here?
  }

  public get length(): number {
    return this.value.length;
  }

  public get refValue(): Array<IModelRef> {
    return this.__rawList.map(getModelRef);
  }

  public toJSON(): any {
    return this.refValue.slice();
  }

  public get snapshot(): any {
    return this.toJSON();
  }

  protected __getList(): Array<T> {
    const list = this.__rawList
      .map(this.__getModel.bind(this))
      .filter((item) => (this.__skipMissing ? Boolean(item) : true))
      .filter((model) => Boolean(model && getModelCollection(model))) as any;
    const instances = list.slice();

    return instances;
  }

  protected __getModel(model: T | IModelRef | null): T | null {
    if (model instanceof PureModel || model === null) {
      return model;
    }

    if (!this.__collection) {
      throw error('The model needs to be in a collection to be referenceable');
    }

    return this.__collection.findOne<T>(model.type, model.id);
  }

  private __reMap(): void {
    for (let i = 0; i < this.__rawList.length; i++) {
      if (isReference(this.__rawList[i])) {
        const model = this.__getModel(this.__rawList[i]);

        if (model) {
          this.__rawList[i] = model;
        }
      }
    }
  }
}
