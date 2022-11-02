import { Collection } from '@datx/core';
import { CachingStrategy, config } from '@datx/jsonapi';
import { createGSSP, jsonapiSwrClient } from '@datx/swr';

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

export const gSSP = createGSSP(createClient);

export const gSP = gSSP;

export type Client = typeof JsonapiSwrClient;
