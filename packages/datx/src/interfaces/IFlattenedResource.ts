import { Schema } from '../Schema';
import { IPlainResource } from './IResource';

export interface IFlattenedResource<TSchema extends Schema, TIsArray extends boolean = false> {
  data: TIsArray extends true ? Array<IPlainResource<TSchema>> : IPlainResource<TSchema>;
  linked: Array<IPlainResource<TSchema>>;
}
