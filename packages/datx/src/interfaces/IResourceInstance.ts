import { IResource } from './IResource';

export type IResourceInstance<
  TResource extends IResource<TInstanceType, TPlainType>,
  TInstanceType,
  TPlainType,
> = ReturnType<TResource['parse']>;
