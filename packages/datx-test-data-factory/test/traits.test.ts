import { createTestClient } from './create-test-client';
import { createFactory, perBuild, sequence } from '../src';
import { User } from './models/User';

const client = createTestClient();
const factory = createFactory(client);

describe('traits', () => {
  beforeEach(() => {
    factory.reset();
  });

  it('should apply admin trait to user model', () => {
    const userFactory = factory(User, {
      fields: {
        id: sequence(),
        name: 'John',
        isAdmin: perBuild(() => false),
      },
      traits: {
        admin: {
          overrides: {
            isAdmin: perBuild(() => true),
          },
        },
      },
    });

    const userNoTrait = userFactory();
    const userWithTrait = userFactory({ traits: 'admin' });

    expect(userNoTrait.isAdmin).toBe(false);
    expect(userWithTrait.isAdmin).toBe(true);
  });

  it('should allow a trait to define a postBuild function', () => {
    const userFactory = factory(User, {
      fields: {
        id: sequence(),
        name: 'John',
        isAdmin: perBuild(() => false),
      },
      traits: {
        admin: {
          overrides: {
            isAdmin: perBuild(() => true),
          },
          postBuild: (user) => {
            user.name = 'postBuildTrait';

            return user;
          },
        },
      },
    });

    const userNoTrait = userFactory();
    const userWithTrait = userFactory({ traits: 'admin' });

    expect(userNoTrait.name).toBe('John');
    expect(userWithTrait.name).toBe('postBuildTrait');
  });

  it('should apply build time overrides over traits', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John',
        isAdmin: perBuild(() => false),
      },
      traits: {
        admin: {
          overrides: { isAdmin: perBuild(() => true) },
        },
      },
    });

    const userWithTrait = userFactory({
      traits: 'admin',
      overrides: {
        isAdmin: perBuild(() => false),
      },
    });

    expect(userWithTrait.isAdmin).toBe(false);
  });

  it('should support multiple traits', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John',
        isAdmin: perBuild(() => false),
      },
      traits: {
        admin: {
          overrides: { isAdmin: perBuild(() => true) },
        },
        bob: {
          overrides: { name: 'Bob' },
        },
      },
    });

    const userWithTrait = userFactory({
      traits: ['admin', 'bob'],
    });

    expect(userWithTrait.isAdmin).toBe(true);
    expect(userWithTrait.name).toBe('Bob');
  });

  it('should passed later override earlier one trait', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John',
      },
      traits: {
        alice: {
          overrides: { name: 'Alice' },
        },
        bob: {
          overrides: { name: 'Bob' },
        },
      },
    });

    const userWithTrait = userFactory({
      traits: ['alice', 'bob'],
    });

    expect(userWithTrait.name).toBe('Bob');
  });

  it('should throw an if used trait is not defined', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John',
      },
    });

    expect(() =>
      userFactory({
        traits: 'non-existing-trait',
      }),
    ).toThrowError(`Trait 'non-existing-trait' was not defined.`);
  });

  it('should override undefined values', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John',
      },
      traits: {
        admin: {
          overrides: {
            isAdmin: true,
          },
        },
      },
    });

    const userWithoutTrait = userFactory();

    expect(userWithoutTrait.isAdmin).toBeUndefined();

    const userWithTrait = userFactory({
      traits: 'admin',
    });

    expect(userWithTrait.name).toBe('John');
    expect(userWithTrait.isAdmin).toBe(true);
  });

  it('should apply latest trait with the value defined', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John',
      },
      traits: {
        tall: {
          overrides: { tall: true },
        },
        short: {
          overrides: { tall: false },
        },
      },
    });

    const userWithTrait = userFactory({
      traits: ['tall', 'short'],
    });

    expect(userWithTrait.tall).toBe(false);
  });
});
