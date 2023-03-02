import { createJsonapiClient } from './create-client';

import { User } from './models/User';
import { getModelMeta } from '@datx/jsonapi';
import { createJsonapiFactory } from '../../src';

const client = createJsonapiClient();
const factory = createJsonapiFactory(client);

describe('jsonapi', () => {
  beforeEach(() => {
    factory.reset();
  });

  it('should build meta fields', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John',
        meta: {
          foo: 'bar',
        },
      },
    });

    const user = userFactory();

    const userMeta = getModelMeta(user);

    expect(user.name).toBe('John');
    expect(userMeta).toEqual({
      foo: 'bar',
    });
  });

  it('should build resource without meta', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John',
      },
    });

    const user = userFactory();

    const userMeta = getModelMeta(user);

    expect(user.name).toBe('John');
    expect(userMeta).toEqual({});
  });

  it('should override meta', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John',
        meta: {
          foo: 'bar',
        },
      },
    });

    const user = userFactory({
      overrides: {
        meta: {
          foo: 'baz',
        },
      },
    });

    const userMeta = getModelMeta(user);

    expect(user.name).toBe('John');
    expect(userMeta).toEqual({
      foo: 'baz',
    });
  });

  it('should override meta with trait', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John',
        meta: {
          foo: 'bar',
        },
      },
      traits: {
        withMeta: {
          overrides: {
            meta: {
              foo: 'baz',
            },
          },
        },
      },
    });

    const user = userFactory({
      traits: ['withMeta'],
    });

    const userMeta = getModelMeta(user);

    expect(user.name).toBe('John');
    expect(userMeta).toEqual({
      foo: 'baz',
    });
  });
});
