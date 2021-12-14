import { Model, Attribute } from '@datx/core';
import { jsonapiModel } from '@datx/jsonapi';

export class Post extends jsonapiModel(Model) {
  static type = 'posts';

  @Attribute({ isIdentifier: true })
  id!: number;

  @Attribute()
  title!: string;

  @Attribute()
  body!: string;
}


