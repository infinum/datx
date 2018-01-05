import { IArrayChange, IArraySplice } from 'mobx';
import { Model } from '../Model';
export declare type TChange = IArraySplice<Model> | IArrayChange<Model>;
