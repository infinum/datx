import {
  QueryExpression,
  GetManyQueryExpression,
  GetOneQueryExpression,
  GetAllQueryExpression,
} from './interfaces/QueryExpression';
import { Client } from './interfaces/Client';

function isGetOne(expression: QueryExpression): expression is GetOneQueryExpression<any> {
  return expression.op === 'getOne';
}

function isGetMany(expression: QueryExpression): expression is GetManyQueryExpression<any> {
  return expression.op === 'getMany';
}

function isGetAll(expression: QueryExpression): expression is GetAllQueryExpression<any> {
  return expression.op === 'getAll';
}

export const createFetcher = (client: Client) => (expression: QueryExpression) => {
  if (isGetOne(expression)) {
    const { type, id, options } = expression;

    return client.getOne(type, id, options);
  }

  if (isGetMany(expression)) {
    const { type, options } = expression;

    return client.getMany(type, options);
  }

  if (isGetAll(expression)) {
    const { type, options, maxRequests } = expression;

    return client.getAll(type, options, maxRequests);
  }


  throw new Error('Invalid expression operation!');
};
