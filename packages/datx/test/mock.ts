import { ArrayOf, Schema, customScalar } from '../src';
import { StringType, NumberType, DateType, BooleanType } from '../src';

export class CustomType {
  public foo = 1;
}

const custom = customScalar(
  (value: CustomType) => value.foo,
  (value: number) => {
    const c = new CustomType();

    c.foo = value;

    return c;
  },
  (value): value is CustomType => value instanceof CustomType,
  (value): value is number => typeof value === 'number',
);

export const User = new Schema(
  {
    username: StringType,
    age: NumberType.optional().default(0),
  },
  'user',
  (data) => `user/${data.username}`,
);

export const Post = new Schema(
  {
    title: StringType,
    date: DateType,
    text: StringType,
  },
  'post',
  (data) => `post/${data.title}`,
);

export const Comment = new Schema(
  {
    author: User,
    post: Post,
    date: DateType,
    text: StringType,
    upvotes: ArrayOf(User),
    featured: BooleanType.optional(),
    test: custom.optional(),
  },
  'comment',
  (data) => `comment/${data.text}`,
);
