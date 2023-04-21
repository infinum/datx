import { Comment } from './Comment';
import { Attribute, Model } from '@datx/core';
import { jsonapi } from '@datx/jsonapi';

export class Post extends jsonapi(Model) {
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
