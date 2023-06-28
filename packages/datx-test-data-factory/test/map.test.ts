import { createClient } from './create-client';
import { createFactory, perBuild } from '../src';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

describe('overrides', () => {
  beforeEach(() => {
    factory.reset();
  });

  it('should apply map changes and fully customise generated object', () => {
    const userFactory = factory(User, {
      fields: {
        name: perBuild(() => 'John'),
        sports: {
          football: true,
          rugby: false,
        },
      },
    });

    const user = userFactory({
      overrides: {
        name: 'customName',
      },
      map: (user) => {
        user.sports.rugby = true;

        return user;
      },
    });

    expect(user.name).toBe('customName');
    expect(user.sports).toEqual({
      football: true,
      rugby: true,
    });
  });

  it('should run map after postBuild', () => {
    const userFactory = factory(User, {
      fields: {
        name: 'test',
      },
      postBuild: (user) => {
        user.name = user.name.toUpperCase();

        return user;
      },
    });

    const user = userFactory({
      overrides: {
        name: 'John',
      },
      map: (user) => {
        expect(user.name).toBe('JOHN');

        user.name = 'new name';

        return user;
      },
    });

    expect(user.name).toBe('new name');
  });
});
