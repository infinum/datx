import {PureModel} from '../PureModel';
import {IDictionary} from './IDictionary';
import {IRawModel} from './IRawModel';
import {IReferenceOptions} from './IReferenceOptions';
import {TRefValue} from './TRefValue';

export interface IActionsMixin<T = PureModel> {
  assign(key: string, value: any): void;
  update(data: IDictionary<any>): void;
  clone(): IActionsMixin<T> & T;
  addReference<V extends PureModel, U extends typeof PureModel>(
    key: string,
    value: TRefValue<V>,
    options: IReferenceOptions<U>,
  );
  toJSON(): IRawModel;
}
