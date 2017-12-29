import {Model} from '../Model';
import {IPropDefaultDecorator} from './IPropDefaultDecorator';

export interface IPropDecorators {
  defaultValue(value: any): IPropDefaultDecorator;
  toOne(refModel: typeof Model): IPropDefaultDecorator;
  toMany(refModel: typeof Model, property?: string): IPropDefaultDecorator;
  toOneOrMany(refModel: typeof Model): IPropDefaultDecorator;
}
