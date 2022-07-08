import { Comment } from '../../../test/mock';
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

    comment.post.date = new Date('2022-08-01T00:00:00.000Z');

    const rawComment = serializeSchema(Comment, comment);

    expect(rawComment.date).toBe('2022-07-01T00:00:00.000Z');
    expect(rawComment.post.date).toBe('2022-08-01T00:00:00.000Z');
    expect(rawComment.text).toBe('This is a test');
    expect(rawComment.test).toBe(2);
  });
});
