import {IPropChainableDecorator} from './IPropChainableDecorator';
import {IPropDecorators} from './IPropDecorators';

export type IProp = IPropChainableDecorator & IPropDecorators;
