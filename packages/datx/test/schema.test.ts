import { Comment, CustomType, User } from './mock';

describe('Schema', () => {
  describe('parsing', () => {
    it('should do basic parsing', () => {
      const comment = Comment.parse({
        date: '2022-07-01T00:00:00.000Z',
        upvotes: [
          {
            username: 'Darko',
          },
        ],
        author: {
          username: 'Darko',
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
      expect(comment.post.date).toBeInstanceOf(Date);
      expect(comment.text).toBe('This is a test');
      expect(comment.test).toBeInstanceOf(CustomType);
    });
  });

  describe('serialization', () => {
    it('should do basic serialization', () => {
      const comment = Comment.parse({
        date: '2022-07-01T00:00:00.000Z',
        upvotes: [
          {
            username: 'Darko',
          },
        ],
        author: {
          username: 'Darko',
        },
        post: {
          title: 'foobar',
          date: '2022-07-01T00:00:00.000Z',
          text: 'Lorem ipsum',
        },
        text: 'This is a test',
        test: 2,
      });

      const rawComment = Comment.serialize(comment);

      expect(rawComment.date).toBe('2022-07-01T00:00:00.000Z');
      expect(rawComment.text).toBe('This is a test');
      expect(rawComment.test).toBe(2);
    });
  });

  describe('validation', () => {
    it('should check for missing properties', () => {
      // @ts-expect-error Wrong on purpose
      const [isError, errors] = User.validate({});
      expect(isError).toBe(true);
      expect(errors).toEqual([
        {
          message: 'Missing required property username',
          pointer: 'username',
        },
      ]);
    });
  });
});
