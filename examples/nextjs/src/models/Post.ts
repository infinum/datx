import { Attribute, PureModel } from '@datx/core';
import { jsonapiModel } from '@datx/jsonapi';

export class Post extends jsonapiModel(PureModel) {
  public static readonly type = 'posts';

  @Attribute({ isIdentifier: true })
  id!: number;

  @Attribute()
  title!: string;

  @Attribute()
  body!: string;
}
