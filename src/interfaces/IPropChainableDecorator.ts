import {Model} from '../Model';
import {IProp} from './IProp';

export type IPropChainableDecorator = <T extends Model>(obj: T, key: string) => IProp;
