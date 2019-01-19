import { IArrayChange, IArraySplice } from 'mobx';

import { PureModel } from '../PureModel';

export type TChange = IArraySplice<PureModel> | IArrayChange<PureModel>;
