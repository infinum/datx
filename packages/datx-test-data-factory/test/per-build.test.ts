import { createTestClient } from './create-test-client';
import { createFactory, perBuild } from '../src';
import { User } from './models/User';

const client = createTestClient();
const factory = createFactory(client);

describe('pre build', () => {
  beforeEach(() => {
    client.reset();
  });

  it('should generates a new avatar url each time', () => {
    const userFactory = factory(User, {
      fields: {
        email: perBuild(() => `user-${Math.random()}@example.com`),
      },
    });

    const user1 = userFactory();
    const user2 = userFactory();

    expect(user1.email).not.toBe(user2.email);
  });
});
