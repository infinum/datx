import { IArrayChange, IArraySplice } from '@datx/utils';
import { PureModel } from '../PureModel';

export type TChange = IArraySplice<PureModel> | IArrayChange<PureModel>;
