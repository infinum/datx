import { ToMany, ToOne, ToOneOrMany } from './buckets';

export { IRawModel } from 'datx-utils';

export const Bucket = { ToMany, ToOne, ToOneOrMany };

export {
  Attribute,
  ViewAttribute,
  prop,
  view,
  IFieldDefinition,
  IReferenceDefinition,
} from './Attribute';
export { Collection } from './Collection';
export { Model } from './Model';
export { PureCollection } from './PureCollection';
export { PureModel } from './PureModel';
export { View } from './View';

export { updateModelId, getRef, getRefId } from './helpers/model/fields';

export { initModelRef } from './helpers/model/init';

export {
  assignModel,
  cloneModel,
  getModelCollection,
  getModelId,
  getModelType,
  getOriginalModel,
  modelToJSON,
  updateModel,
  modelMapParse,
  modelMapSerialize,
  commitModel,
  revertModel,
  isAttributeDirty,
  modelToDirtyJSON,
} from './helpers/model/utils';

export { isCollection, isModel, isView } from './helpers/mixin';

export { IModelRef } from './interfaces/IModelRef';
export { ICollectionConstructor } from './interfaces/ICollectionConstructor';
export { IIdentifier } from './interfaces/IIdentifier';
export { IModelConstructor } from './interfaces/IModelConstructor';
export { IPatch } from './interfaces/IPatch';
export { IType } from './interfaces/IType';
export { IRawCollection } from './interfaces/IRawCollection';
export { IReferenceOptions } from './interfaces/IReferenceOptions';
export { IViewConstructor } from './interfaces/IViewConstructor';
export { IActionsMixin } from './interfaces/IActionsMixin';
export { IMetaMixin } from './interfaces/IMetaMixin';

export { PatchType } from './enums/PatchType';
export { ReferenceType } from './enums/ReferenceType';

export { withActions } from './mixins/withActions';
export { withMeta } from './mixins/withMeta';
export { withPatches } from './mixins/withPatches';
