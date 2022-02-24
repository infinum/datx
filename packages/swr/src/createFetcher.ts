import {
  Expression,
  GetOneExpression,
  GetManyExpression,
  GetAllExpression,
} from './interfaces/QueryExpression';
import { Client } from './interfaces/Client';
import { IJsonapiModel, IRequestOptions } from '@datx/jsonapi';

function isGetOne(expression: Expression<any>): expression is GetOneExpression<any> {
  return expression?.op === 'getOne';
}

function isGetMany(expression: Expression<any>): expression is GetManyExpression<any> {
  return expression?.op === 'getMany';
}

function isGetAll(expression: Expression<any>): expression is GetAllExpression<any> {
  return expression?.op === 'getAll';
}

export const createFetcher =
  (client: Client) =>
  <TModel extends IJsonapiModel>(
    expression: Expression<TModel>,
    config?: Pick<IRequestOptions, 'networkConfig'>,
  ) => {
    const { networkConfig } = config || {};

    if (isGetOne(expression)) {
      const { type, id, queryParams } = expression;

      return client.getOne(type, id, { queryParams, networkConfig });
    }

    if (isGetMany(expression)) {
      const { type, queryParams } = expression;

      return client.getMany(type, { queryParams, networkConfig });
    }

    if (isGetAll(expression)) {
      const { type, queryParams, maxRequests } = expression;

      return client.getAll(type, { queryParams, networkConfig }, maxRequests);
    }

    throw new Error('Invalid expression operation!');
  };
