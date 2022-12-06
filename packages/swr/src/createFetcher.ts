import {
  IGetOneExpression,
  IGetManyExpression,
  IGetAllExpression,
  FetcherExpressionArgument,
  IGetRelatedResourcesExpression,
  IGetRelatedResourceExpression,
} from './interfaces/QueryExpression';
import { ClientInstance } from './interfaces/Client';
import { IJsonapiModel, IRequestOptions } from '@datx/jsonapi';

function isGetOne(expression: FetcherExpressionArgument): expression is IGetOneExpression {
  return expression.op === 'getOne';
}

function isGetMany(expression: FetcherExpressionArgument): expression is IGetManyExpression {
  return expression.op === 'getMany';
}

function isGetAll(expression: FetcherExpressionArgument): expression is IGetAllExpression {
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
  (client: ClientInstance) =>
  <TModel extends IJsonapiModel = IJsonapiModel>(
    expression: FetcherExpressionArgument,
    config?: Pick<IRequestOptions, 'networkConfig'>,
  ) => {
    const { networkConfig } = config || {};

    if (isGetOne(expression)) {
      const { type, id, queryParams } = expression;

      return client.getOne<TModel>(type, id, { queryParams, networkConfig });
    }

    if (isGetMany(expression)) {
      const { type, queryParams } = expression;

      return client.getMany<TModel>(type, { queryParams, networkConfig });
    }

    if (isGetAll(expression)) {
      const { type, queryParams, maxRequests } = expression;

      return client.getAll<TModel>(type, { queryParams, networkConfig }, maxRequests);
    }

    if (isGetRelatedResource(expression)) {
      const { type, relation, queryParams } = expression;

      return client.request<TModel>(`${type}/${relation}`, undefined, undefined, {
        queryParams,
        networkConfig,
      });
    }

    if (isGetRelatedResources(expression)) {
      const { type, relation, queryParams } = expression;

      return client.request<TModel, Array<TModel>>(`${type}/${relation}`, undefined, undefined, {
        queryParams,
        networkConfig,
      });
    }

    throw new Error('Invalid expression operation!');
  };
