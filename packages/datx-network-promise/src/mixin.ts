import { IModelConstructor, mixinBuilder, Model, PureModel } from '@datx/core';
import { Response } from '@datx/network';

interface INetworkModel<TModel> {
  save(): Promise<Response<INetworkModel<TModel>>>;
}

function decorateModel<TModel extends PureModel>(BaseClass: IModelConstructor<TModel>): IModelConstructor<TModel, INetworkModel<TModel>> {
  // @ts-ignore
  return class NetworkModel extends BaseClass {
    public save() {
      return null as any;
    }
  };
}

export const promiseNetwork = mixinBuilder(decorateModel);

class Person extends promiseNetwork(Model) {
  public id!: string;
}

const person = new Person();

person.save().then((resp) => {
  resp.data?.save();
});
