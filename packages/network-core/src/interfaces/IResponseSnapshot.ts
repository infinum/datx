import { IType } from '@datx/core';
import { IResponseObject } from '..';

export interface IResponseSnapshot {
  response: IResponseObject;
  type?: IType;
}
