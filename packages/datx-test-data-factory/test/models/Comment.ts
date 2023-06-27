import { Post } from './Post';
import { User } from './User';
import { Attribute, Model } from '@datx/core';

export class Comment extends Model {
  public static type = 'comments';

  @Attribute({ isIdentifier: true })
  public id!: number;

  @Attribute()
  public body!: string;

  @Attribute({ toOne: User.type })
  public author!: User;

  @Attribute({ toOne: Post.type })
  public post!: Post;
}
