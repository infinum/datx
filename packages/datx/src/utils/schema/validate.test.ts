import { validateSchema } from './validate';
import { Comment, User } from '../../../test/mock';

describe('instance', () => {
  describe('validation', () => {
    it('should check for missing properties', () => {
      // @ts-expect-error Wrong on purpose
      const [isError, errors] = validateSchema(User, {});
      expect(isError).toBe(true);
      expect(errors).toEqual([
        {
          message: 'Missing required property username',
          pointer: 'username',
        },
      ]);
    });

    it('should report an error for extra fields in strict mode', () => {
      const [isError, errors] = validateSchema(
        User,
        {
          username: 'FooBar',
          // @ts-expect-error Wrong on purpose
          foobar: true,
        },
        { strict: true },
      );
      expect(isError).toBe(true);
      expect(errors).toEqual([
        {
          message: 'Extra key foobar found',
          pointer: 'foobar',
        },
      ]);
    });

    it('should not report an error for extra fields in non-strict mode', () => {
      const [isError, errors] = validateSchema(
        User,
        {
          username: 'FooBar',
          // @ts-expect-error Wrong on purpose
          foobar: true,
        },
        { strict: false },
      );
      expect(isError).toBe(false);
      expect(errors).toEqual([]);
    });

    it('should check for wrong primitive types', () => {
      const [isError, errors] = validateSchema(User, {
        // @ts-expect-error Wrong on purpose
        username: 42,
        // @ts-expect-error Wrong on purpose
        age: 'old',
      });
      expect(isError).toBe(true);
      expect(errors).toEqual([
        {
          message: 'Wrong property type for username',
          pointer: 'username',
        },
        {
          message: 'Wrong property type for age',
          pointer: 'age',
        },
      ]);
    });

    it('should throw first error if throw flag is set', () => {
      expect(() =>
        validateSchema(
          User,
          {
            // @ts-expect-error Wrong on purpose
            username: 42,
            // @ts-expect-error Wrong on purpose
            age: 'old',
          },
          { throw: true },
        ),
      ).toThrowError('Wrong property type for username');
    });

    it('should check for invalid custom types (primitive)', () => {
      const [isError, errors] = validateSchema(Comment, {
        date: new Date(),
        upvotes: [],
        author: {
          username: 'FooBar',
        },
        post: {
          title: 'foobar',
          date: new Date(),
          text: 'Lorem ipsum',
        },
        text: 'This is a test',
        // @ts-expect-error Wrong on purpose
        test: 2,
      });

      expect(isError).toBe(true);
      expect(errors).toEqual([
        {
          message: 'Wrong custom property type for test',
          pointer: 'test',
        },
      ]);
    });

    it('should check for invalid custom types (custom)', () => {
      // Same name and signature on purpose
      class CustomType {
        public foo = 1;
      }

      const [isError, errors] = validateSchema(Comment, {
        date: new Date(),
        upvotes: [],
        author: {
          username: 'FooBar',
        },
        post: {
          title: 'foobar',
          date: new Date(),
          text: 'Lorem ipsum',
        },
        text: 'This is a test',
        // TODO: this should be a TS error // @ts-expect-error Wrong on purpose
        test: new CustomType(),
      });

      expect(isError).toBe(true);
      expect(errors).toEqual([
        {
          message: 'Wrong custom instance type for test',
          pointer: 'test',
        },
      ]);
    });

    it('should check nested schemas', () => {
      const [isError, errors] = validateSchema(Comment, {
        date: new Date(),
        upvotes: [],
        author: {
          // @ts-expect-error Wrong on purpose
          username: 42,
          // @ts-expect-error Wrong on purpose
          age: 'old',
        },
        post: {
          // @ts-expect-error Wrong on purpose
          title: true,
          // @ts-expect-error Wrong on purpose
          date: 'today',
          // @ts-expect-error Wrong on purpose
          text: true,
        },
        text: 'This is a test',
      });

      expect(isError).toBe(true);
      expect(errors).toEqual([
        {
          message: 'Wrong property type for username',
          pointer: 'author.username',
        },
        {
          message: 'Wrong property type for age',
          pointer: 'author.age',
        },
        {
          message: 'Wrong property type for title',
          pointer: 'post.title',
        },
        {
          message: 'Wrong custom property type for date',
          pointer: 'post.date',
        },
        {
          message: 'Wrong property type for text',
          pointer: 'post.text',
        },
      ]);
    });
  });
});
