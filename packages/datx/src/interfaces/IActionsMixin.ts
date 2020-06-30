import { IRawModel } from 'datx-utils';

import { PureModel } from '../PureModel';
import { IReferenceOptions } from './IReferenceOptions';
import { TRefValue } from './TRefValue';

export interface IActionsMixin<T = PureModel> {
  assign(key: string, value: any): void;
  update(data: Record<string, any>): void;
  clone(): IActionsMixin<T> & T;
  addReference<V extends PureModel, U extends typeof PureModel>(
    key: string,
    value: TRefValue<V>,
    options: IReferenceOptions<U>,
  );
  commit(): void;
  revert(): void;
  toJSON(): IRawModel;
}
