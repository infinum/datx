import { createClient } from './create-client';
import { createFactory, sequence, perBuild } from '../src';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

describe('overrides', () => {
  beforeEach(() => {
    factory.reset();
  });

  it('should override normal field when building an instance', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John',
      },
    });

    const user = userFactory({
      overrides: {
        name: 'Jane',
      },
    });

    expect(user.name).toBe('Jane');
  });

  it('should override perBuild field when building an instance', () => {
    const userFactory = factory(User, {
      fields: {
        name: perBuild(() => 'John'),
      },
    });

    const user = userFactory({
      overrides: {
        name: 'Jane',
      },
    });

    expect(user.name).toBe('Jane');
  });

  it('should override sequence field when building an instance', () => {
    const userFactory = factory(User, {
      fields: {
        id: sequence(),
      },
    });

    const user = userFactory({
      overrides: {
        id: 1,
      },
    });

    expect(user.id).toBe(1);
  });

  it('should support generators in override fields', () => {
    const userFactory = factory(User, {
      fields: {
        name: sequence((i) => `John ${i}`),
      },
    });

    const user = userFactory({
      overrides: {
        name: sequence((i) => `John ${i}`),
      },
    });

    expect(user.name).toBe('John 1');
  });
});
