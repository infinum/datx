import { Schema } from '../Schema';
import { ICustomScalar } from './ICustomScalar';

export type TResourceType<TInner = unknown> =
  | ICustomScalar<TInner>
  | Schema
  | Array<ICustomScalar<TInner> | Schema>;
