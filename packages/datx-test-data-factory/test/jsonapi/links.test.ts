import { createJsonapiClient } from './create-client';

import { User } from './models/User';
import { getModelLinks } from '@datx/jsonapi';
import { createFactory } from '../../src';

const client = createJsonapiClient();
const factory = createFactory(client);

describe('jsonapi links', () => {
  beforeEach(() => {
    factory.reset();
  });

  it('should build links fields', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John',
        links: {
          self: '/users/1',
        },
      },
    });

    const user = userFactory();

    const userLinks = getModelLinks(user);

    expect(user.name).toBe('John');
    expect(userLinks).toEqual({
      self: '/users/1',
    });
  });

  it('should build resource without links', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John',
      },
    });

    const user = userFactory();

    const userLinks = getModelLinks(user);

    expect(user.name).toBe('John');
    expect(userLinks).toEqual({});
  });

  it('should override links', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John',
        links: {
          self: '/users/1',
        },
      },
    });

    const user = userFactory({
      overrides: {
        links: {
          self: '/users/2',
        },
      },
    });

    const userLinks = getModelLinks(user);

    expect(user.name).toBe('John');
    expect(userLinks).toEqual({
      self: '/users/2',
    });
  });

  it('should override meta with trait', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'John',
        links: {
          self: '/users/1',
        },
      },
      traits: {
        withLinks: {
          overrides: {
            links: {
              self: '/users/2',
            },
          },
        },
      },
    });

    const user = userFactory({
      traits: ['withLinks'],
    });

    const userLinks = getModelLinks(user);

    expect(user.name).toBe('John');
    expect(userLinks).toEqual({
      self: '/users/2',
    });
  });
});
