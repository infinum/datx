import { Constructor } from 'type-fest';
import { Schema } from '../Schema';
import { ICustomScalar } from './ICustomScalar';
import { IResource } from './IResource';
import { TResourceTypes } from './TResourceTypes';

// Map the schema types to instance types
export type TResourceProp<
  TProp extends TResourceTypes,
  TPlain extends boolean,
> = TProp extends Schema
  ? IResource<TProp, TPlain> | undefined // Schema
  : TProp extends Array<infer TInnerProp>
  ? // Array of types
    TInnerProp extends TResourceTypes
    ? Array<TResourceProp<TInnerProp, TPlain>>
    : never
  : TProp extends {
      type: infer TInnerProp;
      optional: true;
      defaultValue?: any;
    }
  ? // Type options object (optional)
    TInnerProp extends TResourceTypes
    ? TResourceProp<TInnerProp, TPlain> | undefined
    : never
  : TProp extends {
      type: infer TInnerProp;
      optional?: false;
      defaultValue?: any;
    }
  ? // Type options object (mandatory)
    TInnerProp extends TResourceTypes
    ? TResourceProp<TInnerProp, TPlain>
    : never
  : TProp extends ICustomScalar<infer TInnerProp, infer TPlainProp>
  ? TPlain extends true
    ? TProp['optional'] extends true
      ? TPlainProp | undefined
      : TPlainProp
    : TProp['optional'] extends true
    ? TInnerProp | undefined
    : TInnerProp // Custom scalar
  : TProp extends Constructor<any>
  ? InstanceType<TProp> // Primitive values
  : never;
