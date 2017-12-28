import {Model} from '../Model';
import {IDictionary} from './IDictionary';
import {IRawModel} from './IRawModel';

export interface IActionsMixin<T = Model> {
  assign(key: string, value: any): void;
  update(data: IDictionary<any>): void;
  clone(): IActionsMixin<T> & T;
  toJSON(): IRawModel;
}
