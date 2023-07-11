import { User, Comment, CustomType } from '../../../test/mock';
import { Collection } from '../../Collection';
import { parseSchema } from './parse';

describe('parse', () => {
  it('should do basic parsing', () => {
    const user = User.parse({
      username: 'FooBar',
      age: 27,
    });

    expect(user.username).toBe('FooBar');
    expect(user.age).toBe(27);
  });

  it('should do nested parsing with custom types', () => {
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

    expect(comment.date.toISOString()).toBe('2022-07-01T00:00:00.000Z');
    expect(comment.post?.date).toBeInstanceOf(Date);
    expect(comment.text).toBe('This is a test');
    expect(comment.test).toBeInstanceOf(CustomType);
  });

  it('should reuse instances when using a collection', () => {
    const collection = new Collection();

    const comment = parseSchema(
      Comment,
      {
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
      },
      // collection,
    );

    expect(Object.keys(collection.byId)).toHaveLength(3);

    expect(comment.author?.username).toBe('FooBar');
    expect(comment.author).toEqual({ username: 'FooBar', age: 0 });
    expect(comment.author).toBe(comment.upvotes[0]);
    expect(comment.featured).toBe(undefined);
  });
});
