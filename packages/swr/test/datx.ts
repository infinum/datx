import { Collection } from '@datx/core';
import { jsonapiCollection, config, Response } from '@datx/jsonapi';

import { Expression, createFetcher } from '../src';
import { DatxJsonapiModel } from '../src/interfaces/DatxJsonapiModel';
import { BASE_URL } from './constants';
import { Todo } from './models/Todo';

export class Client extends jsonapiCollection(Collection) {
  public static types = [Todo];

  private _fallback = new Map();

  public async fetchQuery<TModel extends DatxJsonapiModel>(expression: Expression<TModel>) {
    try {
      const response = await createFetcher(this)(expression);
      this._fallback.set(expression.type, response.data);

      return {
        [expression.type]: response,
      };
    } catch (error) {
      if (error instanceof Response) {
        throw error.error;
      }

      throw error;
    }
  }

  public get fallback() {
    return JSON.stringify(Object.fromEntries(this._fallback));
  }
}

export function createClient() {
  config.baseUrl = BASE_URL;
  config.cache = 1;

  return new Client();
}
