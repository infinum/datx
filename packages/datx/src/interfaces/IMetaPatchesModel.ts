import {PureModel} from '../PureModel';
import {IPatch} from './IPatch';

export interface IMetaPatchesModel<T = PureModel> {
  applyPatch(patch: IPatch<T>): void;
  undoPatch(patch: IPatch<T>): void;

  onPatch(listener: (patch: IPatch<T>) => void): () => void;
}
