import { Model } from '../Model';
import { IPropChainableDecorator } from './IPropChainableDecorator';
export interface IPropDecorators {
    identifier: IPropChainableDecorator;
    type: IPropChainableDecorator;
    defaultValue(value: any): IPropChainableDecorator;
    toOne(refModel: typeof Model): IPropChainableDecorator;
    toMany(refModel: typeof Model, property?: string): IPropChainableDecorator;
    toOneOrMany(refModel: typeof Model): IPropChainableDecorator;
}
