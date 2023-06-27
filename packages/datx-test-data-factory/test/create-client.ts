import { Collection } from '@datx/core';

import { Comment } from './models/Comment';
import { Post } from './models/Post';
import { User } from './models/User';

export class TestClient extends Collection {
  public static types = [User, Post, Comment];
}

export const createClient = () => {
  const client = new TestClient();

  return client;
};
