import { Attribute, Model } from '@datx/core';
import { jsonapi } from '@datx/jsonapi';
import { IImage } from '../../interfaces';

export class User extends jsonapi(Model) {
  public static type = 'users';

  @Attribute({ isIdentifier: true })
  public id!: number;

  @Attribute()
  public name!: string;

  @Attribute()
  public email!: string;

  @Attribute()
  public isAdmin!: boolean;

  @Attribute()
  public avatar!: IImage;

  @Attribute()
  public tall!: boolean;

  @Attribute({
    parse: (value: string) => value && new Date(value),
    serialize: (value: Date) => value && value.toISOString(),
  })
  public createdAt?: Date;
}
