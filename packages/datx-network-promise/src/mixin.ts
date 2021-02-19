import { ICollectionConstructor, IModelConstructor, mixinBuilder, PureCollection, PureModel } from '@datx/core';
import { BaseRequest, saveModel } from '@datx/network';
import { INetworkDefModel } from '@datx/network/dist/interfaces/INetworkDefModel';
import { IResponseType } from './interfaces/IResponseType';

interface INetworkModelMethods<TModel extends PureModel> {
  save(): IResponseType<INetworkModel<TModel>>;
}

type INetworkModel<TModel extends PureModel> = INetworkModelMethods<TModel> & TModel;

interface INetworkCollection {
  getOne<TModel extends PureModel>(
    modelType: IModelConstructor<TModel> | string,
    id: string,
  ): IResponseType<INetworkModel<TModel>>;

  getMany<TModel extends PureModel>(
    modelType: IModelConstructor<TModel> | string,
  ): IResponseType<Array<INetworkModel<TModel>>>;
}

function decorateModel<TModel extends PureModel>(
  BaseClass: IModelConstructor<TModel> & INetworkDefModel<IResponseType<TModel>>,
): IModelConstructor<TModel, INetworkModel<TModel>> {
  // @ts-ignore
  return class NetworkModel extends BaseClass {
    public save(): IResponseType<INetworkModel<TModel>> {
      return saveModel(this);
    }
  };
}

function decorateCollection<TCollection extends PureCollection>(
  BaseClass: ICollectionConstructor<TCollection>,
): ICollectionConstructor<TCollection, INetworkCollection> {
  // @ts-ignore
  return class NetworkCollection extends BaseClass {
    public static BaseRequest = BaseRequest;

    public getOne<TModel extends PureModel>(
      _modelType: IModelConstructor<TModel> | string,
      _id: string,
    ): IResponseType<INetworkModel<TModel>> {
      return null as any;
    }

    public getMany<TModel extends PureModel>(
      _modelType: IModelConstructor<TModel> | string,
    ): IResponseType<Array<INetworkModel<TModel>>> {
      return null as any;
    }
  };
}

export const promiseNetwork = mixinBuilder(decorateModel, decorateCollection);

// class Person extends promiseNetwork(PureModel) {
//   public id!: string;
// }

// class Store extends promiseNetwork(PureCollection) {
//   public static types = [Person];
// }

// const person = new Person();
// const store = new Store();

// person.save().then((resp) => {
//   console.log(resp.data?.id);
//   resp.data?.save();
// });

// store.getOne(Person, '12').then((resp) => {
//   console.log(resp.data?.id);
//   resp.data?.save();
// });

// store.getOne('person', '12').then((resp) => {
//   console.log(resp.data?.id);
//   resp.data?.save();
// });
