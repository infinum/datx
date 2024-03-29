import { setMeta, getMeta, IRawModel } from '@datx/utils';

import { PatchType } from '../enums/PatchType';
import { error } from '../helpers/format';
import { isCollection, isModel } from '../helpers/mixin';
import { getModelId, getModelType, updateModel } from '../helpers/model/utils';
import { reverseAction } from '../helpers/patch';
import { ICollectionConstructor } from '../interfaces/ICollectionConstructor';
import { IMetaPatchesCollection } from '../interfaces/IMetaPatchesCollection';
import { IMetaPatchesModel } from '../interfaces/IMetaPatchesModel';
import { IModelConstructor } from '../interfaces/IModelConstructor';
import { IPatch } from '../interfaces/IPatch';
import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';
import { MetaModelField } from '../enums/MetaModelField';
import { IRawCollection } from '../interfaces/IRawCollection';

function inversePatch<T = PureModel>(patch: IPatch<T>): IPatch<T> {
  const patchType: PatchType = reverseAction(patch.patchType);

  return {
    model: patch.model,
    newValue: patch.oldValue,
    oldValue: patch.newValue,
    patchType,
  };
}

export function withPatches<T extends PureModel>(
  Base: IModelConstructor<T>,
): IModelConstructor<IMetaPatchesModel & T>;

export function withPatches<T extends PureCollection>(
  Base: ICollectionConstructor<T>,
): ICollectionConstructor<IMetaPatchesCollection & T>;

export function withPatches<T extends PureCollection>(
  Base: ICollectionConstructor<T> | IModelConstructor<T>,
): IModelConstructor<IMetaPatchesModel & T> | ICollectionConstructor<IMetaPatchesCollection & T> {
  if (isCollection(Base)) {
    const BaseClass = Base as typeof PureCollection;

    class WithPatches extends BaseClass implements IMetaPatchesCollection {
      private __patchListeners: Array<(patch: IPatch) => void> = [];

      constructor(data?: Array<IRawModel> | IRawCollection) {
        super(data);
        Object.defineProperty(this, '__patchListeners', {
          enumerable: false,
        });
      }

      public applyPatch(patch: IPatch): void {
        const model = this.findOne(patch.model.type, patch.model.id);

        if (patch.patchType === PatchType.REMOVE) {
          if (model) {
            this.removeOne(model);
          } else {
            // console.log('The model should already exist for a remove patch. Ignoring...');
          }
        } else if (patch.patchType === PatchType.UPDATE) {
          if (model && patch.newValue) {
            updateModel(model, patch.newValue);
          } else if (!model) {
            throw error('The model should already exist for an update patch');
          } else {
            throw error("New patch value isn't set for an update patch");
          }
        } else if (model) {
          throw error("The model shouldn't exist before a create patch");
        } else if (!patch.newValue) {
          throw error("New patch value isn't set for a create patch");
        } else {
          this.add(patch.newValue, patch.model.type);
        }
      }

      public undoPatch(patch: IPatch): void {
        this.applyPatch(inversePatch(patch));
      }

      public onPatch(listener: (patch: IPatch) => void): () => void {
        this.__patchListeners.push(listener);

        return (): void => {
          this.__patchListeners = this.__patchListeners.filter((item) => item !== listener);
        };
      }
    }

    return (WithPatches as any) as ICollectionConstructor<IMetaPatchesCollection & T>;
  }

  if (isModel(Base)) {
    const BaseClass = Base as typeof PureModel;

    class WithPatches extends BaseClass {
      constructor(rawData?: IRawModel, collection?: PureCollection) {
        super(rawData, collection);
        setMeta(this, MetaModelField.PatchListeners, []);
      }

      public applyPatch(patch: IPatch): void {
        if (patch.model.type === getModelType(this) && patch.model.id === getModelId(this)) {
          updateModel(this, patch.newValue || {});
        } else {
          // console.log('Wrong match model');
        }
      }

      public undoPatch(patch: IPatch): void {
        this.applyPatch(inversePatch(patch));
      }

      public onPatch(listener: (patch: IPatch) => void): () => void {
        const listeners = getMeta<Array<(patch: IPatch) => void>>(
          this,
          MetaModelField.PatchListeners,
          [],
        );

        listeners.push(listener);

        return (): void => {
          setMeta(
            this,
            MetaModelField.PatchListeners,
            listeners.filter((item) => item !== listener),
          );
        };
      }
    }

    return (WithPatches as any) as IModelConstructor<IMetaPatchesModel & T>;
  }

  throw error('Only Models and Collections can be decorated with patches');
}
