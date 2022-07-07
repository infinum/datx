import { DateType, Schema } from '../src';

export class CustomType {
  public foo: number = 1;
}

export const User = new Schema('user', {
  username: String,
  age: { type: Number, optional: true, defaultValue: 'test' },
});

export const Post = new Schema('post', {
  title: String,
  date: DateType,
  text: String,
});

export const Comment = new Schema('comment', {
  author: { type: User, optional: false },
  post: Post,
  date: DateType,
  text: String,
  upvotes: [User],
  featured: { type: Boolean, optional: true },
  test: {
    serialize(value: CustomType) {
      return value.foo;
    },
    parseValue(value: number) {
      const c = new CustomType();
      c.foo = value;
      return c;
    },
    optional: true,
  },
});
