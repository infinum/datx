import { Collection } from '@datx/core';
import { config } from '@datx/jsonapi';

import { jsonapiSwrClient } from '../src';
import { BASE_URL } from './constants';
import { Todo } from './models/Todo';

export class Client extends jsonapiSwrClient(Collection) {
  public static types = [Todo];
}

export function createClient() {
  config.baseUrl = BASE_URL;
  config.cache = 1;

  return new Client();
}
