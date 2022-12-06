import { ICollectionConstructor, PureCollection } from '@datx/core';
import { IJsonapiCollection, IJsonapiModel, IRawResponse, jsonapiCollection } from '@datx/jsonapi';
import { unstable_serialize } from 'swr';
import { createFetcher } from './createFetcher';
import { IFetchQueryConfiguration } from './interfaces/IFetchQueryConfiguration';
import { IFetchQueryReturn } from './interfaces/IFetchQueryReturn';
import { IJsonapiSwrClient } from './interfaces/IJsonapiSwrClient';
import { IResponseData } from './interfaces/IResponseData';
import { Expression, ExpressionArgument } from './interfaces/QueryExpression';
import { Data, Model } from './interfaces/UseDatx';
import { isCollectionResponse, isSingleResponse } from './Response';
import { isFunction } from './utils';

export function jsonapiSwrClient(BaseClass: typeof PureCollection) {
  class JsonapiSwrClient extends jsonapiCollection(BaseClass) implements IJsonapiSwrClient {
    public static types = [];
    private __fallback: Record<string, unknown> = {};

    public async fetchQuery<
      TExpression extends Expression,
      TModel extends IJsonapiModel = Model<TExpression>,
      TData extends IResponseData = Data<TExpression, TModel>,
    >(expression: TExpression, config?: IFetchQueryConfiguration) {
      try {
        const executableExpression = isFunction(expression)
          ? expression()
          : (expression as ExpressionArgument);
        if (!executableExpression) {
          throw new Error(`Expression can't be empty, got: ${executableExpression}`);
        }

        const fetcher = createFetcher(this);
        const response = await fetcher<TModel>(executableExpression);
        const key = unstable_serialize(expression);

        // clone response to avoid mutation
        const rawResponse = { ...(response['__internal'].response as IRawResponse) };

        delete rawResponse.collection;
        this.__fallback[key] = rawResponse;

        return {
          data: response,
        } as IFetchQueryReturn<TData>;
      } catch (error) {
        const prefetch = config?.prefetch;
        if (isFunction(prefetch) ? prefetch(error) : prefetch) {
          return {
            data: undefined,
            error,
          };
        }

        if (isSingleResponse<TModel>(error) || isCollectionResponse<TModel>(error)) {
          throw error.error;
        }

        throw error;
      }
    }

    public get fallback() {
      return JSON.parse(JSON.stringify(this.__fallback));
    }
  }

  return JsonapiSwrClient as ICollectionConstructor<
    PureCollection & IJsonapiCollection & IJsonapiSwrClient
  >;
}
