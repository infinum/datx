import { ICollectionConstructor, PureCollection } from '@datx/core';
import {
  IJsonapiCollection,
  IJsonapiModel,
  IRequestOptions,
  jsonapiCollection,
} from '@datx/jsonapi';
import { unstable_serialize } from 'swr';
import { createFetcher } from './createFetcher';
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
import {
  CollectionResponse,
  dehydrateResponse,
  isCollectionResponse,
  isSingleResponse,
  SingleResponse,
} from './Response';
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
      const { prefetch, hydrate = true } = config || {};

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

        if (hydrate) {
          this.__fallback[key] = dehydrateResponse(response);
        }

        // @ts-expect-error logic is correct, but TS is not able to infer it
        return {
          data: response,
          error: undefined,
        };
      } catch (error) {
        if (isFunction(prefetch) ? prefetch(error) : prefetch) {
          // @ts-expect-error logic is correct, but TS is not able to infer it
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

    /**
     * @override
     * @deprecated Use `requestSingle` or `requestCollection` instead
     */
    public request(): never {
      throw new Error('Use `requestSingle` or `requestCollection` instead');
    }

    public requestSingle<T extends IJsonapiModel = IJsonapiModel>(
      url: string,
      method?: string | undefined,
      data?: object | undefined,
      options?: IRequestOptions | undefined,
    ): Promise<SingleResponse<T>> {
      return super.request<T>(url, method, data, options) as Promise<SingleResponse<T>>;
    }

    public requestCollection<T extends IJsonapiModel = IJsonapiModel>(
      url: string,
      method?: string | undefined,
      data?: object | undefined,
      options?: IRequestOptions | undefined,
    ): Promise<CollectionResponse<T>> {
      return super.request<T>(url, method, data, options) as Promise<CollectionResponse<T>>;
    }
  }

  return JsonapiSwrClient as ICollectionConstructor<
    PureCollection & IJsonapiCollection & IJsonapiSwrClient
  >;
}
