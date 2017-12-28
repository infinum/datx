import {Collection} from '../Collection';
import {Model} from '../Model';
import {IDictionary} from './IDictionary';
import {IIdentifier} from './IIdentifier';
import {IRawModel} from './IRawModel';
import {IType} from './IType';
import {TFilterFn} from './TFilterFn';

export interface ICollection {
  length: number;

  insert(data: Array<IRawModel>): Array<Model>;

  add<T extends Model>(data: T): T;
  add<T extends Model>(data: Array<T>): Array<T>;
  add<T extends Model>(data: IDictionary<any>, model: IType|{new(): T}): T;
  add<T extends Model>(data: Array<IDictionary<any>>, model: IType|{new(): T}): Array<T>;

  find(model: IType|typeof Model, id?: IIdentifier): Model|null;
  find(test: TFilterFn): Model|null;

  filter(test: TFilterFn): Array<Model>;

  findAll(model?: IType|typeof Model): Array<Model>;

  hasItem(model: Model): boolean;

  toJSON(): Array<IRawModel>;

  remove(model: IType|typeof Model, id?: IIdentifier);
  remove(model: Model);
}
