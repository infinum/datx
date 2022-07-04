import { TJson } from './TJson';

export interface ICustomScalar<TInstance = any, TPlain extends TJson = any> {
  name?: string;
  description?: string;
  serialize(value: TInstance): TPlain;
  parseValue(value: TPlain): TInstance;
}
