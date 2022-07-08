import { Schema } from '../Schema';
import { ISchemaData } from './ISchemaData';
import { TResourceProp } from './TResourceProp';
declare type TOptionalKey<TSchema extends ISchemaData, TKey extends keyof TSchema, TValue = TSchema[TKey]> = Exclude<TValue, NonNullable<TValue>> extends never ? never : TKey;
declare type TOptionalKeys<TSchema extends ISchemaData, U extends keyof TSchema = keyof TSchema> = U extends any ? TOptionalKey<TSchema, U> : never;
declare type IOptionalResource<TSchema extends ISchemaData, TKeys extends keyof TSchema = TOptionalKeys<TSchema>> = {
    [k in TKeys]?: Exclude<TSchema[k], undefined>;
};
declare type IMandatoryResource<TSchema extends IRecord<any>, TKeys extends keyof TSchema = Exclude<keyof TSchema, TOptionalKeys<TSchema>>> = {
    [k in TKeys]: TSchema[k];
};
declare type IRecord<TSchema extends Schema, TPlain extends boolean = false> = {
    [P in keyof TSchema['definition']]: TResourceProp<TSchema['definition'][P], TPlain>;
};
export declare type IResource<TSchema extends Schema, TPlain extends boolean = false> = IMandatoryResource<IRecord<TSchema, TPlain>> & IOptionalResource<IRecord<TSchema, TPlain> & ISchemaData>;
export declare type IPlainResource<TSchema extends Schema> = IMandatoryResource<IRecord<TSchema, true>> & IOptionalResource<IRecord<TSchema, true>>;
export {};
