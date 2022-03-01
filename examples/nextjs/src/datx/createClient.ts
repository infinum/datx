import { Collection } from '@datx/core';
import { jsonapiCollection, config, Response } from '@datx/jsonapi';
import { createFetcher, DatxJsonapiModel, Expression } from '@datx/swr';

import { Post } from '../models/Post';
import { Todo } from '../models/Todo';

class Client extends jsonapiCollection(Collection) {
  public static types = [Todo, Post];

  private _fallback = new Map();

  public async fetchQuery<TModel extends DatxJsonapiModel>(expression: Expression<TModel>) {
    try {
      const response = await createFetcher(this)(expression);
      this._fallback.set(expression.type, response);

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
    return Object.fromEntries(this._fallback);
  }
}

export function createClient() {
  config.baseUrl = process.env.NEXT_PUBLIC_JSONAPI_URL as string;
  config.cache = 1;

  return new Client();
}
