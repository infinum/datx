import { createJsonapiClient } from './create-client';
import { createFactory } from '../../src';
import { User } from './models/User';
import { modelToJsonApi } from '@datx/jsonapi';

const client = createJsonapiClient();
const factory = createFactory(client);

describe('jsonapi issues', () => {
  beforeEach(() => {
    factory.reset();
  });

  it('should convert model to json:api payload with correct id', () => {
    const userFactory = factory(User, {
      fields: {
        id: 1,
      },
    });

    const user = userFactory();

    const jsonapiUser = modelToJsonApi(user);

    expect(jsonapiUser.id).toBe('1');
  });
});
