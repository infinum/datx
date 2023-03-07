import { IOuterType } from './IOuterType';
import { TResourceType } from './TResourceType';

export interface ISchemaData<TResourceTypeProp extends TResourceType = TResourceType> {
  [key: string]: IOuterType<TResourceTypeProp>;
}
