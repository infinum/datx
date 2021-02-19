import { getModelId, getModelType, modelToDirtyJSON, modelToJSON, PureModel } from '@datx/core';
import { getMeta, setMeta } from '@datx/utils';
import { INetworkDefModel } from '../interfaces/INetworkDefModel';

export function isModelPersisted(model: PureModel): boolean {
  return getMeta(model, 'PERSISTED', false);
}

export function setModelPersisted(model: PureModel, state = true): void {
  setMeta(model, 'PERSISTED', state);
}

function execNetworkAction<TResponseType>(model: InstanceType<INetworkDefModel<TResponseType>>, type: 'create' | 'read' | 'update' | 'delete' | 'patch') {
  const ModelClass = model.constructor as INetworkDefModel<TResponseType>;
  let request = ModelClass.network?.one?.[type];
  let isPatch = type === 'patch';

  if (type === 'update' && !request) {
    isPatch = true;
    request = ModelClass.network?.one?.patch;
  }

  if (!request) {
    throw new Error(`The request type one.${type} was not defined on the model ${getModelType(model)}`);
  }

  return request.fetch({ id: getModelId(model) }, null, isPatch ? modelToDirtyJSON(model) : modelToJSON(model));
}

export function saveModel<TResponseType>(model: InstanceType<INetworkDefModel<TResponseType>>): TResponseType {
  return execNetworkAction<TResponseType>(model, isModelPersisted(model) ? 'update' : 'create');
}