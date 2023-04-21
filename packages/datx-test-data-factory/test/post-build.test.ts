import { createClient } from './create-client';
import { createFactory, perBuild } from '../src';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

describe('post build', () => {
  beforeEach(() => {
    factory.reset();
  });

  it('should run postBuild transformer', () => {
    const userFactory = factory(User, {
      fields: {
        name: perBuild(() => 'John Doe'),
      },
      postBuild: (user) => {
        user.name = 'Jane Doe';

        return user;
      },
    });

    const user = userFactory();

    expect(user.name).toBe('Jane Doe');
  });

  it('should run postBuild transformer after applying overrides', () => {
    const userFactory = factory(User, {
      fields: {
        name: perBuild(() => 'John Doe'),
      },
      postBuild: (user) => {
        user.name = 'Jane Doe';

        return user;
      },
    });

    const user = userFactory({ overrides: { name: 'Joseph Doe' } });

    expect(user.name).toBe('Jane Doe');
  });

  it('should transform name to uppercase in postBuild transformer', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John Doe',
      },
      postBuild: (user) => {
        user.name = user.name.toUpperCase();

        return user;
      },
    });

    const user = userFactory();

    expect(user.name).toBe('JOHN DOE');
  });

  it('should apply traits postBuild transformers', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John Doe',
      },
      traits: {
        trait1: {
          postBuild: (user) => {
            user.name = 'trait 1';

            return user;
          },
        },
        trait2: {
          postBuild: (user) => {
            user.name = 'trait 2';

            return user;
          },
        },
      },
    });

    const user = userFactory({
      traits: ['trait1', 'trait2'],
    });

    expect(user.name).toBe('trait 2');
  });

  it('should apply traits postBuild transformers before main postBuild', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John Doe',
      },
      traits: {
        trait1: {
          postBuild: (user) => {
            user.name = 'trait 1';

            return user;
          },
        },
        trait2: {
          postBuild: (user) => {
            user.name = 'trait 2';

            return user;
          },
        },
      },
      postBuild: (user) => {
        expect(user.name).toBe('trait 2');

        user.name = 'main post build';

        return user;
      },
    });

    const user = userFactory({
      traits: ['trait1', 'trait2'],
    });

    expect(user.name).toBe('main post build');
  });
});
