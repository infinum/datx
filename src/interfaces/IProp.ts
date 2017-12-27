import {IPropDecorators} from './IPropDecorators';
import {IPropDefaultDecorator} from './IPropDefaultDecorator';

export type IProp = IPropDefaultDecorator & IPropDecorators;
