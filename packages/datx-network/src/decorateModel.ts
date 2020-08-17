import { PureModel, PureCollection } from 'datx';
import { META_FIELD, IRawModel, setMeta } from 'datx-utils';

import { IRequestOptions } from './interfaces/IRequestOptions';
import { INetworkModel } from './interfaces/INetworkModel';
import { NETWORK_PERSISTED } from './consts';
import { saveModel, removeModel } from './helpers/model';
import { IModelNetworkConfig } from './interfaces/IModelNetworkConfig';
import { INetworkModelConstructor } from './interfaces/INetworkModelConstructor';

const HYDRATIZATION_KEYS = [NETWORK_PERSISTED];

export function decorateModel(BaseClass: typeof PureModel): INetworkModelConstructor {
  class NetworkModel extends BaseClass {
    public static network?: IModelNetworkConfig;

    constructor(data: IRawModel = {}, collection?: PureCollection) {
      super(data, collection);

      const modelMeta = data?.[META_FIELD] || {};

      HYDRATIZATION_KEYS.forEach((key) => {
        if (key in modelMeta) {
          setMeta(this, key, modelMeta[key]);
        }
      });
    }

    public save(options?: IRequestOptions): Promise<INetworkModel> {
      return saveModel((this as unknown) as INetworkModel, options);
    }

    public destroy(options?: IRequestOptions): Promise<void> {
      return removeModel(this, options);
    }
  }

  return NetworkModel;
}
