import {Model} from '../Model';

export type IPropDefaultDecorator = <T extends Model>(obj: T, key: string) => void;
