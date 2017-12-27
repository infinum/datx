import {IPropDefaultDecorator} from './IPropDefaultDecorator';

export interface IPropDecorators {
  defaultValue(value: any): IPropDefaultDecorator;
}
