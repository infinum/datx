import { Expression } from '@datx/swr';
import { Post } from 'src/models/Post';

export const queryPosts: Expression<Post> = {
  op: 'getMany',
  type: Post,
};
