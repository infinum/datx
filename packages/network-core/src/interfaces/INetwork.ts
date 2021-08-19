import { IAsync } from './IAsync';
import { Network } from '../Network';

export type INetwork<IA extends IAsync<any> = IAsync<any>> = Network<IA>;
