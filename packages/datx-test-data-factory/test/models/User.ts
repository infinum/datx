import { Attribute, Model } from '@datx/core';

export interface IImage {
  url: string;
}

export class User extends Model {
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
