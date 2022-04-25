import { IGetManyExpression } from '@datx/swr';
import { Post } from 'src/models/Post';

export const postsQuery: IGetManyExpression<typeof Post> = {
  op: 'getMany',
  type: Post.type,
};
