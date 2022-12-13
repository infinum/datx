import { IJsonapiModel, IRequestOptions } from '@datx/jsonapi';
import { IClientInstance, JsonapiModel } from './interfaces/Client';
import { IGetAllSWRResponse } from './interfaces/IFetchQueryReturn';
import {
  FetcherExpressionArgument,
  IGetAllExpression,
  IGetManyExpression,
  IGetOneExpression,
  IGetRelatedResourceExpression,
  IGetRelatedResourcesExpression,
} from './interfaces/QueryExpression';
import { CollectionResponse, SingleResponse } from './Response';

function isGetOne(expression: FetcherExpressionArgument): expression is IGetOneExpression {
  return expression.op === 'getOne';
}

function isGetMany(expression: FetcherExpressionArgument): expression is IGetManyExpression {
  return expression.op === 'getMany';
}

export function isGetAll(expression: FetcherExpressionArgument): expression is IGetAllExpression {
  return expression.op === 'getAll';
}

function isGetRelatedResource(
  expression: FetcherExpressionArgument,
): expression is IGetRelatedResourceExpression {
  return expression.op === 'getRelatedResource';
}

function isGetRelatedResources(
  expression: FetcherExpressionArgument,
): expression is IGetRelatedResourcesExpression {
  return expression.op === 'getRelatedResources';
}

export const createFetcher =
  (client: IClientInstance) =>
  <TModel extends JsonapiModel = JsonapiModel>(
    expression: FetcherExpressionArgument,
    config?: Pick<IRequestOptions, 'networkConfig'>,
  ) => {
    const { networkConfig } = config || {};

    if (isGetOne(expression)) {
      const { type, id, queryParams } = expression;

      return client.getOne<TModel>(type, id, {
        queryParams,
        networkConfig,
        fetchOptions: {
          Response: SingleResponse,
        },
      }) as Promise<SingleResponse<TModel>>;
    }

    if (isGetMany(expression)) {
      const { type, queryParams } = expression;

      return client.getMany<TModel>(type, {
        queryParams,
        networkConfig,
        fetchOptions: {
          Response: CollectionResponse,
        },
      }) as Promise<CollectionResponse<TModel>>;
    }

    if (isGetAll(expression)) {
      const { type, queryParams, maxRequests } = expression;

      return client.getAll<TModel>(
        type,
        {
          queryParams,
          networkConfig,
          fetchOptions: {
            Response: CollectionResponse,
          },
        },
        maxRequests,
      ) as Promise<IGetAllSWRResponse<TModel>>;
    }

    if (isGetRelatedResource(expression)) {
      const { type, id, relation, queryParams } = expression;

      return client.request(`${type}/${id}/${relation}`, undefined, undefined, {
        queryParams,
        networkConfig,
        fetchOptions: {
          Response: SingleResponse,
        },
      }) as Promise<SingleResponse<IJsonapiModel>>;
    }

    if (isGetRelatedResources(expression)) {
      const { type, id, relation, queryParams } = expression;

      return client.request(`${type}/${id}/${relation}`, undefined, undefined, {
        queryParams,
        networkConfig,
        fetchOptions: {
          Response: CollectionResponse,
        },
      }) as Promise<CollectionResponse<IJsonapiModel>>;
    }

    throw new Error('Invalid expression operation!');
  };
