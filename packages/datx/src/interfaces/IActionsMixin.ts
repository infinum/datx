import {IDictionary, IRawModel} from 'datx-utils';

import {PureModel} from '../PureModel';
import {IReferenceOptions} from './IReferenceOptions';
import {TRefValue} from './TRefValue';

export interface IActionsMixin<T = PureModel> {
  assign(key: string, value: any): void;
  update(data: IDictionary): void;
  clone(): IActionsMixin<T> & T;
  addReference<V extends PureModel, U extends typeof PureModel>(
    key: string,
    value: TRefValue<V>,
    options: IReferenceOptions<U>,
  );
  toJSON(): IRawModel;
}
