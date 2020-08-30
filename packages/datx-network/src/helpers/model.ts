import { INetworkModel } from '../interfaces/INetworkModel';
import { IRequestOptions } from '../interfaces/IRequestOptions';
import { getMeta, setMeta } from 'datx-utils';
import { NETWORK_PERSISTED } from '../consts';
import { INetworkModelConstructor } from '../interfaces/INetworkModelConstructor';
import { BaseRequest } from '../BaseRequest';
import { method, setUrl, query, header, cache, body } from '../operators';
import { HttpMethod } from '../enums/HttpMethod';
import { Response } from '../Response';
import { PureModel, commitModel, getModelCollection, getModelId } from 'datx';
import { action } from 'mobx';

function handleResponse<T extends INetworkModel = INetworkModel>(
  record: T,
): (response: Response<T>) => T {
  return action(
    (response: Response<T>): T => {
      if (response.error) {
        throw response.error;
      }

      if (response.status === 204) {
        setMeta(record, NETWORK_PERSISTED, true);

        return record;
      }

      setMeta(record, NETWORK_PERSISTED, true);

      const data = (response.replaceData(record).data as T) || record;

      commitModel(data);

      return data;
    },
  );
}

export function saveModel<TModel extends INetworkModel>(
  model: TModel,
  options?: IRequestOptions,
): Promise<TModel> {
  const ModelConstructor = model.constructor as INetworkModelConstructor;
  if (!ModelConstructor.network) {
    throw new Error('The network property needs to be defined on the model');
  }
  const isPersisted = getMeta(model, NETWORK_PERSISTED, false);

  let baseRequest: BaseRequest | undefined;
  if (ModelConstructor.network instanceof BaseRequest) {
    baseRequest = isPersisted
      ? ModelConstructor.network.pipe(
          method(HttpMethod.Put),
          setUrl(
            `${ModelConstructor.network['_options'].url}/{id}`,
            (ModelConstructor as unknown) as typeof PureModel,
          ),
        )
      : ModelConstructor.network.pipe(method(HttpMethod.Post));
  } else {
    baseRequest = isPersisted ? ModelConstructor.network.update : ModelConstructor.network.create;
  }

  if (!baseRequest) {
    throw new Error('The base request has not been defined');
  }

  const request = baseRequest.pipe<TModel>(
    options?.query && query(options?.query),
    options?.networkConfig?.headers && header(options?.networkConfig?.headers),
    options?.cacheOptions?.cachingStrategy &&
      cache(options?.cacheOptions?.cachingStrategy, options?.cacheOptions?.maxAge),
    body(model),
  );

  return request.fetch({ id: getModelId(model) }).then(handleResponse(model));
}

export function removeModel<TModel extends INetworkModel>(
  model: TModel,
  options?: IRequestOptions,
): Promise<void> {
  const ModelConstructor = model.constructor as INetworkModelConstructor;
  if (!ModelConstructor.network) {
    throw new Error('The network property needs to be defined on the model');
  }
  const isPersisted = getMeta(model, NETWORK_PERSISTED, false);

  let baseRequest: BaseRequest | false | undefined;
  if (ModelConstructor.network instanceof BaseRequest) {
    baseRequest = isPersisted
      ? ModelConstructor.network.pipe(
          method(HttpMethod.Delete),
          setUrl(
            `${ModelConstructor.network['_options'].url}/{id}`,
            (ModelConstructor as unknown) as typeof PureModel,
          ),
        )
      : false;
  } else {
    baseRequest = isPersisted ? ModelConstructor.network.destroy : false;
  }

  if (!baseRequest && baseRequest !== false) {
    throw new Error('The base request has not been defined');
  }

  if (baseRequest) {
    baseRequest
      .pipe<TModel>(
        options?.query && query(options?.query),
        options?.networkConfig?.headers && header(options?.networkConfig?.headers),
        options?.cacheOptions?.cachingStrategy &&
          cache(options?.cacheOptions?.cachingStrategy, options?.cacheOptions?.maxAge),
      )
      .fetch({ id: getModelId(model) })
      .then(() => {
        const collection = getModelCollection(model);
        if (collection) {
          collection.removeOne(model);
        }
      });
  }

  return Promise.resolve();
}
