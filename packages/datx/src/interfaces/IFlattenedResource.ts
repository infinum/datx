import { Schema } from '../Schema';
import { IPlainResource } from './IResource';

export interface IFlattenedResource<TSchema extends Schema> {
  data: IPlainResource<TSchema>;
  linked: Array<IPlainResource<TSchema>>;
}
