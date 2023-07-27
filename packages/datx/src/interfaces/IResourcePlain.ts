import { IResource } from './IResource';

export type IResourcePlain<
  TInstanceType,
  TPlainType,
  TResource extends IResource<TInstanceType, TPlainType> = IResource<TInstanceType, TPlainType>,
> = ReturnType<TResource['serialize']>;
