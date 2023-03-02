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
});
