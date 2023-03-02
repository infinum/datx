import { createClient } from './create-client';
import { bool, createFactory, oneOf } from '../src';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

describe('oneOf', () => {
  beforeEach(() => {
    factory.reset();
  });

  it('should picks a random entry from the given selection', () => {
    const userFactory = factory(User, {
      fields: {
        name: oneOf('a', 'b', 'c'),
      },
    });

    const user = userFactory();

    expect(['a', 'b', 'c']).toContain(user.name);
  });

  it('should picks a random entry from the given selection', () => {
    const userFactory = factory(User, {
      fields: {
        isAdmin: bool(),
      },
    });

    const user = userFactory();

    expect(typeof user.isAdmin === 'boolean').toBeTruthy();
  });
});
