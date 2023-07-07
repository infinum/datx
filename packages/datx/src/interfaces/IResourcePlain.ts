import { IResource } from './IResource';

export type IResourcePlain<
  TResource extends IResource<TInstanceType, TPlainType>,
  TInstanceType,
  TPlainType,
> = ReturnType<TResource['serialize']>;
