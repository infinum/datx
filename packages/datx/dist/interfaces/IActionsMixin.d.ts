import { Model } from '../Model';
import { IDictionary } from './IDictionary';
import { IRawModel } from './IRawModel';
import { IReferenceOptions } from './IReferenceOptions';
import { TRefValue } from './TRefValue';
export interface IActionsMixin<T = Model> {
    assign(key: string, value: any): void;
    update(data: IDictionary<any>): void;
    clone(): IActionsMixin<T> & T;
    addReference<V extends Model, U extends typeof Model>(key: string, value: TRefValue<V>, options: IReferenceOptions<U>): any;
    toJSON(): IRawModel;
}
