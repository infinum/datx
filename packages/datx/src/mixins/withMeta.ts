import { getMeta, IRawModel } from 'datx-utils';
import { computed } from 'mobx';

import { error } from '../helpers/format';
import { isModel } from '../helpers/mixin';
import {
  getModelCollection,
  getModelId,
  getModelType,
  modelToJSON,
  isAttributeDirty,
} from '../helpers/model/utils';
import { IBucket } from '../interfaces/IBucket';
import { IMetaMixin } from '../interfaces/IMetaMixin';
import { IModelConstructor } from '../interfaces/IModelConstructor';
import { PureModel } from '../PureModel';
import { MetaModelField } from '../enums/MetaModelField';
import { IFieldDefinition } from '../Attribute';
import { IIdentifier } from '../interfaces/IIdentifier';
import { IType } from '../interfaces/IType';
import { PureCollection } from '../PureCollection';
import { IModelRef } from '../interfaces/IModelRef';

/**
 * Extends the model with the exposed meta data
 *
 * @export
 * @template T
 * @param {IModelConstructor<T>} Base Model to extend
 * @returns Extended model
 */
export function withMeta<T extends PureModel = PureModel>(
  Base: IModelConstructor<T>,
): IModelConstructor<IMetaMixin<T> & T> {
  const BaseClass = Base as typeof PureModel;

  if (!isModel(BaseClass)) {
    throw error('This mixin can only decorate models');
  }

  class MetaClass {
    private readonly __instance: T;

    constructor(instance: T) {
      this.__instance = instance;
    }

    @computed
    public get collection(): PureCollection | undefined {
      return getModelCollection(this.__instance);
    }

    @computed
    public get id(): IIdentifier {
      return getModelId(this.__instance);
    }

    @computed
    public get original(): T | undefined {
      const originalId = getMeta(this.__instance, MetaModelField.OriginalId);
      const collection = getModelCollection(this.__instance);

      return (originalId && collection?.findOne(this.__instance, originalId)) || undefined;
    }

    @computed
    public get refs(): Record<string, IModelRef | Array<IModelRef> | null> {
      const fields = getMeta<Record<string, IFieldDefinition>>(
        this.__instance,
        MetaModelField.Fields,
        {},
      );

      const refs = {};

      Object.keys(fields)
        .filter((field) => fields[field].referenceDef)
        .forEach((key) => {
          const bucket: IBucket<PureModel> | undefined = getMeta(this.__instance, `ref_${key}`);

          if (bucket) {
            refs[key] = (bucket && bucket.refValue) || null;
          }
        });

      return refs;
    }

    @computed
    public get dirty(): Record<string, boolean> {
      const fields = getMeta<Record<string, IFieldDefinition>>(
        this.__instance,
        MetaModelField.Fields,
        {},
      );

      const dirty = {};

      Object.keys(fields).forEach((key) => {
        dirty[key] = isAttributeDirty(this.__instance, key as any);
      });

      return dirty;
    }

    @computed
    public get snapshot(): any {
      return modelToJSON(this.__instance);
    }

    @computed
    public get type(): IType {
      return getModelType(this.__instance);
    }
  }

  class WithMeta extends BaseClass implements IMetaMixin {
    // @ts-ignore
    public readonly meta = new MetaClass(this);

    constructor(rawData?: IRawModel, collection?: PureCollection) {
      super(rawData, collection);
      Object.defineProperty(this, 'meta', {
        enumerable: false,
      });
    }
  }

  return (WithMeta as unknown) as IModelConstructor<IMetaMixin<T> & T>;
}
