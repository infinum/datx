import { JsonValue } from 'type-fest';
import { Collection } from '../Collection';

export interface ICustomScalar<TInstance = any, TPlain extends JsonValue = any> {
  name?: string;
  description?: string;
  serialize(value: TInstance, depth?: number): TPlain;
  parseValue(value: TPlain, collection?: Collection): TInstance;
  optional?: boolean;
}
