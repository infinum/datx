import { Collection } from '@datx/core';
import { CachingStrategy, config } from '@datx/jsonapi';
import { jsonapiSwrClient } from '@datx/swr';

import { Post } from '../models/Post';
import { Todo } from '../models/Todo';

export class JsonapiSwrClient extends jsonapiSwrClient(Collection) {
  public static types = [Todo, Post];
}

export function createClient() {
  config.baseUrl = process.env.NEXT_PUBLIC_JSONAPI_URL as string;
  config.cache = CachingStrategy.NetworkOnly;

  const client = new JsonapiSwrClient();

  return client;
}

export type Client = typeof JsonapiSwrClient;
