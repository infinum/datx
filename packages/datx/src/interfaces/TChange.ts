import {IArrayChange, IArraySplice} from 'mobx';

import {Model} from '../Model';

export type TChange = IArraySplice<Model> | IArrayChange<Model>;
