import { ICollectionConstructor, PureCollection } from '@datx/core';
import { IJsonapiCollection, IRawResponse, jsonapiCollection } from '@datx/jsonapi';
import { IGetAllResponse } from '@datx/jsonapi/dist/interfaces/IGetAllResponse';
import { unstable_serialize } from 'swr';
import { createFetcher, isGetAll } from './createFetcher';
import { JsonapiModel } from './interfaces/Client';
import { IFetchQueryConfiguration } from './interfaces/IFetchQueryConfiguration';
import { IFetchAllQueryReturn, IFetchQueryReturn } from './interfaces/IFetchQueryReturn';
import { IJsonapiSwrClient } from './interfaces/IJsonapiSwrClient';
import { IResponseData } from './interfaces/IResponseData';
import {
  ExactExpressionArgument,
  Expression,
  ExpressionArgument,
  IGetAllExpression,
  IGetRelatedResourceExpression,
  IGetRelatedResourcesExpression,
} from './interfaces/QueryExpression';
import { Data, Model } from './interfaces/UseDatx';
import { isCollectionResponse, isSingleResponse } from './Response';
import { isFunction } from './utils';

export function jsonapiSwrClient(BaseClass: typeof PureCollection) {
  class JsonapiSwrClient extends jsonapiCollection(BaseClass) implements IJsonapiSwrClient {
    public static types = [];
    private __fallback: Record<string, unknown> = {};

    public async fetchQuery<
      TExpression extends Expression,
      TModel extends JsonapiModel = Model<TExpression>,
      TData extends IResponseData = Data<TExpression, TModel>,
    >(
      expression: TExpression,
      config?: IFetchQueryConfiguration,
    ): Promise<
      ExactExpressionArgument<TExpression> extends IGetAllExpression
        ? IFetchAllQueryReturn<TModel>
        : ExactExpressionArgument<TExpression> extends
            | IGetRelatedResourceExpression
            | IGetRelatedResourcesExpression
        ? ExactExpressionArgument<TExpression> extends { readonly relation: infer TRelation }
          ? TRelation extends keyof TModel
            ? TModel[TRelation] extends JsonapiModel | Array<JsonapiModel>
              ? IFetchQueryReturn<TModel[TRelation]>
              : never
            : never
          : never
        : IFetchQueryReturn<TData>
    > {
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

        if (isGetAll(executableExpression)) {
          const rawResponses = (response as IGetAllResponse<TModel>).responses.map((r) => {
            const raw = { ...r['__internal'].response };
            delete raw.collection;

            return raw;
          });

          this.__fallback[key] = rawResponses;

          // @ts-ignore
          return {
            data: response,
            error: undefined,
          };
        }

        // clone response to avoid mutation
        const rawResponse = { ...(response['__internal'].response as IRawResponse) };
        delete rawResponse.collection;

        this.__fallback[key] = rawResponse;

        // @ts-ignore
        return {
          data: response,
          error: undefined,
        };
      } catch (error) {
        const prefetch = config?.prefetch;
        if (isFunction(prefetch) ? prefetch(error) : prefetch) {
          // @ts-ignore
          return {
            data: undefined,
            error,
          };
        }

        if (isSingleResponse(error) || isCollectionResponse(error)) {
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
