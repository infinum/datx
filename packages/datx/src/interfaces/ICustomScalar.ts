import { JsonValue } from 'type-fest';
import { Collection } from '../Collection';

export interface ICustomScalar<TInstance = unknown, TPlain extends JsonValue = any> {
  serialize(
    value: TInstance,
    depth?: number,
    flatten?: boolean,
    contained?: Array<string | number>,
  ): TPlain;
  parseValue(
    value: TPlain,
    key: string | number,
    item: Partial<TInstance>,
    collection?: Collection,
  ): TInstance;
  test?: (item: unknown) => item is TInstance;
}
