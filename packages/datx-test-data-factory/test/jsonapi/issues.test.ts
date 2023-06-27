import { createJsonapiClient } from './create-client';
import { createFactory } from '../../src';
import { User } from './models/User';
import { isModelPersisted, modelToJsonApi } from '@datx/jsonapi';
import { Comment } from './models/Comment';

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

  it('should convert relationship model to json:api payload with correct id', () => {
    const userFactory = factory(User, {
      fields: {
        id: 1,
      },
    });

    const commentFactory = factory(Comment, {
      fields: {
        id: 1,
        author: userFactory(),
      },
    });

    const comment = commentFactory();

    const jsonapiUser = modelToJsonApi(comment.author);

    expect(jsonapiUser.id).toBe('1');
  });

  it('should set model to persisted', () => {
    const userFactory = factory(User, {
      fields: {
        id: 1,
      },
    });

    const user = userFactory();

    expect(isModelPersisted(user)).toBe(true);
  });
});
