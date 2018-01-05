import {Model} from '../Model';

export type TFilterFn = (item: Model, index: number, arr: Array<Model>) => boolean;
