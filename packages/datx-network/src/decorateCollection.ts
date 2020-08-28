import { PureCollection, PureModel, IType, getModelType } from 'datx';

import { IRequestOptions } from './interfaces/IRequestOptions';
import { INetworkCollection } from './interfaces/INetworkCollection';
import { INetworkModel } from './interfaces/INetworkModel';
import { Response } from './Response';
import { INetworkModelConstructor } from './interfaces/INetworkModelConstructor';
import { BaseRequest } from './BaseRequest';
import { addOptionsToRequest } from './helpers/utils';
import { setUrl } from './operators';
import { INetworkCollectionConstructor } from './interfaces/INetworkCollectionConstructor';

export function decorateCollection(
  BaseClass: typeof PureCollection,
): INetworkCollectionConstructor {
  class NetworkCollection extends BaseClass implements INetworkCollection {
    private getConstructor(
      type: IType | INetworkModel | INetworkModelConstructor,
    ): INetworkModelConstructor {
      return (getModelType(type) as unknown) as INetworkModelConstructor;
    }

    public getOne<T extends INetworkModel = INetworkModel>(
      type: IType | INetworkModelConstructor,
      id: string,
      options?: IRequestOptions,
    ): Promise<Response<T>> {
      const root = this.getConstructor(type);

      if (!root || !root.network) {
        throw new Error('The network configuration is wrong for the given model');
      }

      if (root.network instanceof BaseRequest) {
        return addOptionsToRequest<T, { id: string }>(
          root.network.pipe<T>(
            setUrl(`${root.network['_options'].url}/{id}`, (root as unknown) as typeof PureModel),
          ),
          options,
        ).fetch({
          id,
        });
      }

      if (!root.network.getOne) {
        throw new Error('The getOne network request was not defined on the given model');
      }

      return addOptionsToRequest<T, { id: string }>(root.network.getOne as any, options).fetch({
        id,
      });
    }

    public getMany<T extends INetworkModel = INetworkModel>(
      type: IType | INetworkModelConstructor,
      options?: IRequestOptions,
    ): Promise<Response<T>> {
      const root = this.getConstructor(type);

      if (!root || !root.network) {
        throw new Error('The network configuration is wrong for the given model');
      }

      if (root.network instanceof BaseRequest) {
        return addOptionsToRequest<T, { id: string }>(root.network as any, options).fetch();
      }

      if (!root.network.getMany) {
        throw new Error('The getMany network request was not defined on the given model');
      }

      return addOptionsToRequest<T, { id: string }>(root.network.getMany as any, options).fetch();
    }

    public removeOne(
      type: IType | typeof PureModel,
      id: string,
      options?: boolean | IRequestOptions,
    ): Promise<void>;
    public removeOne(model: INetworkModel, options?: boolean | IRequestOptions): Promise<void>;
    public removeOne(
      type: IType | typeof PureModel | INetworkModel,
      id?: string | boolean | IRequestOptions,
      options?: boolean | IRequestOptions,
    ): Promise<void> {
      const realType = getModelType(type);
      const realId =
        typeof id !== 'object' && typeof id !== 'undefined' && typeof id !== 'boolean' ? id : null;
      const realOptions: boolean | IRequestOptions | undefined = (realId !== null
        ? options
        : id) as boolean | IRequestOptions | undefined;
      const model = realId ? this.findOne<INetworkModel>(realType, realId) : realType;

      if (!model) {
        throw new Error('The model was not found');
      }

      if (realOptions === false || realOptions === undefined) {
        return Promise.resolve(super.removeOne(model));
      }

      return (model as INetworkModel)
        .destroy(typeof realOptions === 'object' ? realOptions : {})
        .then(() => {
          super.removeOne(model);
        });
    }
  }

  return (NetworkCollection as unknown) as INetworkCollectionConstructor & typeof PureCollection;
}
