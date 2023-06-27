import { Collection } from '@datx/core';
import { jsonapi } from '@datx/jsonapi';

import { Post } from '../models/Post';
import { User } from './models/User';
import { Comment } from './models/Comment';

export class JsonapiTestClient extends jsonapi(Collection) {
  public static types = [User, Post, Comment];
}

export const createJsonapiClient = () => {
  const client = new JsonapiTestClient();

  return client;
};
