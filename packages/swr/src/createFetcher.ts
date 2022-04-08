import {
  Expression,
  IGetOneExpression,
  IGetManyExpression,
  IGetAllExpression,
} from './interfaces/QueryExpression';
import { Client } from './interfaces/Client';
import { IJsonapiModel, IRequestOptions } from '@datx/jsonapi';

function isGetOne(expression: Expression): expression is IGetOneExpression {
  return expression.op === 'getOne';
}

function isGetMany(expression: Expression): expression is IGetManyExpression {
  return expression.op === 'getMany';
}

function isGetAll(expression: Expression): expression is IGetAllExpression {
  return expression.op === 'getAll';
}

export const createFetcher =
  (client: Client) => <TModel extends IJsonapiModel = IJsonapiModel>(
    expression: Expression,
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

    throw new Error('Invalid expression operation!');
  };
