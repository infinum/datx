import { Schema, StringType } from '../..';
import { Comment } from '../../../test/mock';
// import { Collection } from '../../Collection';
import { lazySchema } from '../helpers';
import { parseSchema } from './parse';
import { serializeSchema } from './serialize';

describe('serialization', () => {
  it('should do nested serialization with custom types', () => {
    const comment = parseSchema(Comment, {
      date: '2022-07-01T00:00:00.000Z',
      upvotes: [
        {
          username: 'FooBar',
        },
      ],
      author: {
        username: 'FooBar',
      },
      post: {
        title: 'foobar',
        date: '2022-07-01T00:00:00.000Z',
        text: 'Lorem ipsum',
      },
      text: 'This is a test',
      test: 2,
    });

    // This is ok in the test because it will fail if the type is wrong

    comment.post.date = new Date('2022-08-01T00:00:00.000Z');

    const rawComment = serializeSchema(Comment, comment);

    expect(rawComment.date).toBe('2022-07-01T00:00:00.000Z');
    expect(rawComment.post?.date).toBe('2022-08-01T00:00:00.000Z');
    expect(rawComment.text).toBe('This is a test');
    expect(rawComment.test).toBe(2);
  });

  it('should work for circular references and fixed depth', () => {
    const Foo = new Schema(
      {
        name: StringType,
        bar: lazySchema(() => Bar),
      },
      'foo',
      (data) => `foo/${data.name}`,
    );

    const Bar = new Schema(
      {
        name: StringType,
        foo: Foo,
      },
      'bar',
      (data) => `bar/${data.name}`,
    );

    // const collection = new Collection();

    const foo = parseSchema(
      Foo,
      {
        name: 'foo',
        bar: {
          name: 'bar',
          foo: {
            name: 'foo',
            bar: {
              name: 'bar',
              foo: {
                name: 'foo',
              },
            },
          },
        },
      },
      // collection,
    );

    // expect(Object.keys(collection.byId)).toHaveLength(2);

    const rawFoo = serializeSchema(Foo, foo, 2);

    expect(rawFoo?.bar?.foo).toHaveProperty('name', 'foo');
  });
});
