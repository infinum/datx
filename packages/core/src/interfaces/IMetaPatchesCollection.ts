import { PureModel } from '../PureModel';
import { IPatch } from './IPatch';

export interface IMetaPatchesCollection<T = PureModel> {
  applyPatch(patch: IPatch<T>): void;
  undoPatch(patch: IPatch<T>): void;

  onPatch(listener: (patch: IPatch<T>) => void): () => void;
}
