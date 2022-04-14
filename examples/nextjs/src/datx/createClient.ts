import { Collection } from '@datx/core';
import { config } from '@datx/jsonapi';
import { jsonapiSwrClient } from '@datx/swr';

import { Post } from '../models/Post';
import { Todo } from '../models/Todo';

class JsonapiSwrClient extends jsonapiSwrClient(Collection) {
  public static types = [Todo, Post];
}

export function createClient() {
  config.baseUrl = process.env.NEXT_PUBLIC_JSONAPI_URL as string;
  config.cache = 1;

  return new JsonapiSwrClient();
}

declare module '@datx/swr' {
  export interface IClient {
    types: typeof JsonapiSwrClient['types'][number];
  }
}
