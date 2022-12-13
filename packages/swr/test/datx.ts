import { Collection } from '@datx/core';
import { config } from '@datx/jsonapi';

import { jsonapiSwrClient } from '@datx/swr';
import { BASE_URL } from './constants';
import { Person } from './models/Person';
import { Todo } from './models/Todo';
import { TodoList } from './models/TodoList';

export class JsonapiSwrClient extends jsonapiSwrClient(Collection) {
  public static types = [Person, Todo, TodoList];
}

export function createClient() {
  config.baseUrl = BASE_URL;
  config.cache = 1;

  return new JsonapiSwrClient();
}

type Client = typeof JsonapiSwrClient;

declare module '@datx/swr' {
  export interface IClient extends Client {
    types: Client['types'];
  }
}
