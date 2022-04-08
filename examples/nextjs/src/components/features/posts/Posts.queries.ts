import { Expression } from '@datx/swr';
import { Post } from 'src/models/Post';

export const postsQuery: Expression = {
  op: 'getMany',
  type: Post.type,
};
