import { IResource, Schema, type } from '../src';

export class CustomType {
  public foo = 1;
}

export const User = new Schema(
  'user',
  {
    username: type.String,
    age: { type: type.Number, optional: true, defaultValue: 0 },
  },
  (data: IResource<Schema>) => `user/${data.username}`,
);

export const Post = new Schema(
  'post',
  {
    title: type.String,
    date: type.Date,
    text: type.String,
  },
  (data: IResource<Schema>) => `post/${data.title}`,
);

export const Comment = new Schema(
  'comment',
  {
    author: User,
    post: Post,
    date: type.Date,
    text: type.String,
    upvotes: [User],
    featured: { type: type.Boolean, optional: true },
    test: {
      serialize(value: CustomType) {
        return value.foo;
      },
      parseValue(value: number) {
        if (typeof value !== 'number') {
          throw new Error('Invalid custom type');
        }
        const c = new CustomType();
        c.foo = value;
        return c;
      },
      optional: true,
    },
  },
  (data: IResource<Schema>) => `comment/${data.text}`,
);
