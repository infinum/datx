import { IType } from './IType';

export interface IReferences {
  [name: string]: IType | { model: IType; property: string };
}
