import { IRawModel } from '@datx/utils';

import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';
import { IModelConstructor } from './IModelConstructor';
import { IRawCollection } from './IRawCollection';
import { IType } from './IType';

export interface ICollectionConstructor<T = PureCollection> {
  types: Array<typeof PureModel | IModelConstructor>;
  views: Record<
    string,
    {
      modelType: IType | PureModel;
      sortMethod?: string | ((PureModel) => any);
      unique?: boolean;
      mixins?: Array<(view: any) => any>;
    }
  >;

  new (data?: Array<IRawModel> | IRawCollection): T;
}
