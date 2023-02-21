import { createTestClient } from './create-test-client';
import { createFactory } from '../src';
import { Post } from './models/Post';
import { User } from './models/User';

const client = createTestClient();
const factory = createFactory(client);

describe('general', () => {
  beforeEach(() => {
    client.reset();
  });

  it('should build a basic object from a factory', () => {
    const postFactory = factory(Post, {
      fields: {
        body: 'Hello world',
      },
    });

    const post = postFactory();

    expect(post).toBeInstanceOf(Post);
    expect(post.body).toBe('Hello world');
  });

  it('should generates the same email each time', () => {
    const userFactory = factory(User, {
      fields: {
        email: `user-${Math.random()}@example.com`,
      },
    });

    const user1 = userFactory();
    const user2 = userFactory();

    expect(user1.email).toBe(user2.email);
  });

  it('should create Data and override it correctly', () => {
    const userFactory = factory(User, {
      fields: {
        createdAt: new Date('2020-01-01'),
      },
    });

    const user1 = userFactory();
    const user2 = userFactory({ overrides: { createdAt: new Date('2020-02-01') } });

    expect(user1.createdAt).toEqual(new Date('2020-01-01'));
    expect(user2.createdAt).toEqual(new Date('2020-02-01'));
  });
});
