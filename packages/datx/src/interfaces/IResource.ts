import { SetOptional } from 'type-fest';
import { Schema } from '../Schema';
import { ISchemaData } from './ISchemaData';
import { TResourceProp } from './TResourceProp';

type TOptionalKey<
  TSchema extends Record<string, unknown>,
  TKey extends keyof TSchema,
  TValue = TSchema[TKey],
> = Exclude<TValue, NonNullable<TValue>> extends never ? never : TKey;

type TOptionalKeys<
  TSchema extends Record<string, unknown>,
  U extends keyof TSchema = keyof TSchema,
> = U extends any ? TOptionalKey<TSchema, U> : never;

type IRecord<TSchema extends Schema, TPlain extends boolean = false> = {
  [P in keyof TSchema['definition']]: TResourceProp<TSchema['definition'][P]['type'], TPlain>;
};

export type IResource<
  TSchema extends Schema,
  TPlain extends boolean = false,
  TRecord extends Record<string, unknown> = IRecord<TSchema, TPlain>,
> = SetOptional<TRecord, TOptionalKeys<TRecord>>;

export type IPlainResource<
  TSchema extends Schema,
  TRecord extends ISchemaData = IRecord<TSchema, true>,
> = SetOptional<TRecord, TOptionalKeys<TRecord>>;
