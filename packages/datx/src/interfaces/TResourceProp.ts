import { Schema } from '../Schema';
import { ICustomScalar } from './ICustomScalar';
import { IResource } from './IResource';
import { IInnerType } from './IInnerType';
import { TResourceType } from './TResourceType';

type TSchemaProp<TInner extends TResourceType, TPlain extends boolean> = TInner extends Schema
  ? IResource<TInner, TPlain>
  : never;

type TScalarProp<
  TInner extends TResourceType,
  TPlain extends boolean,
> = TInner extends ICustomScalar<infer TInnerProp, infer TPlainProp>
  ? TPlain extends true
    ? TPlainProp
    : TInnerProp
  : never;

type TArrayProp<TInner extends TResourceType, TPlain extends boolean> = TInner extends Array<
  infer TInnerProp
>
  ? // Array of types
    TInnerProp extends IInnerType<any>
    ? Array<TResourceProp<TInnerProp, TPlain>>
    : never
  : never;

export type TResourceProp<
  TProp extends IInnerType<any> | TResourceType,
  TPlain extends boolean,
> = TProp extends IInnerType<infer TType>
  ? TSchemaProp<TType, TPlain> | TScalarProp<TType, TPlain> | TArrayProp<TType, TPlain>
  : TProp extends TResourceType
  ? TSchemaProp<TProp, TPlain> | TScalarProp<TProp, TPlain> | TArrayProp<TProp, TPlain>
  : never;
