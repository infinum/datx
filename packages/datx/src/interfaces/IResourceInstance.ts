import { IResource } from './IResource';

export type IResourceInstance<
  TInstanceType,
  TPlainType,
  TResource extends IResource<TInstanceType, TPlainType> = IResource<TInstanceType, TPlainType>,
> = ReturnType<TResource['parse']>;
