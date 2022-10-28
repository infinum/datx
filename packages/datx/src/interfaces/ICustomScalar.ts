import { JsonValue } from 'type-fest';
import { Collection } from '../Collection';
import { Schema } from '../Schema';
import { IResource } from './IResource';

export interface ICustomScalar<TInstance = any, TPlain extends JsonValue = any> {
  name?: string;
  description?: string;
  serialize(
    value: TInstance,
    depth?: number,
    flatten?: boolean,
    contained?: Array<string | number>,
  ): TPlain;
  parseValue(
    value: TPlain,
    key: string | number,
    item: Partial<IResource<Schema>>,
    collection?: Collection,
  ): TInstance;
  optional?: boolean;
}
