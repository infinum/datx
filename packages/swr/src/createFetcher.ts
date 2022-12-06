import {
  IGetOneExpression,
  IGetManyExpression,
  IGetAllExpression,
  FetcherExpressionArgument,
} from './interfaces/QueryExpression';
import { IClientInstance } from './interfaces/Client';
import { IJsonapiModel, IRequestOptions } from '@datx/jsonapi';
import { CollectionResponse, SingleResponse } from './Response';

function isGetOne(expression: FetcherExpressionArgument): expression is IGetOneExpression {
  return expression.op === 'getOne';
}

function isGetMany(expression: FetcherExpressionArgument): expression is IGetManyExpression {
  return expression.op === 'getMany';
}

function isGetAll(expression: FetcherExpressionArgument): expression is IGetAllExpression {
  return expression.op === 'getAll';
}

export const createFetcher =
  (client: IClientInstance) =>
  <TModel extends IJsonapiModel = IJsonapiModel>(
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
      });
    }

    if (isGetMany(expression)) {
      const { type, queryParams } = expression;

      return client.getMany<TModel>(type, {
        queryParams,
        networkConfig,
        fetchOptions: {
          Response: CollectionResponse,
        },
      });
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
      );
    }

    throw new Error('Invalid expression operation!');
  };
