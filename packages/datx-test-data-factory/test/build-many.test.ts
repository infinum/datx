import { createClient } from './create-client';
import { createFactory, buildMany, perBuild, sequence } from '../src';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

describe('build many', () => {
  beforeEach(() => {
    factory.reset();
  });

  it('should build multiple objects', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John Doe',
      },
    });

    const users = buildMany(userFactory, 3);

    expect(users).toHaveLength(3);
    expect(users[0].name).toBe('John Doe');
    expect(users[1].name).toBe('John Doe');
    expect(users[2].name).toBe('John Doe');
  });

  it('should override normal field when building multiple instances', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John',
      },
    });

    const users = buildMany(userFactory, 3, {
      overrides: {
        name: 'Jane',
      },
    });

    expect(users[0].name).toBe('Jane');
    expect(users[1].name).toBe('Jane');
    expect(users[2].name).toBe('Jane');
  });

  it('should override perBuild field when building multiple instances', () => {
    const userFactory = factory(User, {
      fields: {
        name: perBuild(() => 'John'),
      },
    });

    const users = buildMany(userFactory, 3, {
      overrides: {
        name: 'Jane',
      },
    });

    expect(users[0].name).toBe('Jane');
    expect(users[1].name).toBe('Jane');
    expect(users[2].name).toBe('Jane');
  });

  it('should override sequence field when building multiple instances', () => {
    const userFactory = factory(User, {
      fields: {
        id: sequence(),
      },
    });

    const users = buildMany(userFactory, 3, {
      overrides: {
        id: 1,
      },
    });

    expect(users[0].id).toBe(1);
    expect(users[1].id).toBe(1);
    expect(users[2].id).toBe(1);
  });
});
