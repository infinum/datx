import { Comment } from './Comment';
import { Attribute, Model } from '@datx/core';

export class Post extends Model {
  public static type = 'posts';

  @Attribute({ isIdentifier: true })
  public id!: number;

  @Attribute()
  public title!: string;

  @Attribute()
  public body!: string;

  @Attribute({ toMany: 'comments' })
  public comments!: Array<Comment>;
}
