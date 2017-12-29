import {Model} from '../Model';
import {IProp} from './IProp';

export type IPropDefaultDecorator = <T extends Model>(obj: T, key: string) => IProp;
