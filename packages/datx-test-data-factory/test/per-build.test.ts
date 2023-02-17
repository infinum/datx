import { createTestClient } from './create-test-client';
import { createFactory, perBuild } from '../src';
import { User } from './models/User';

const client = createTestClient();
const factory = createFactory(client);

describe('pre build', () => {
	beforeEach(() => {
		client.reset();
	});

	it('should generates a new object each time', () => {
		const userFactory = factory(User, {
			fields: {
				avatar: perBuild(() => ({
					url: 'https://example.com/avatar.png',
				})),
			},
		});

		const user1 = userFactory();
		const user2 = userFactory();

		expect(user1.avatar).toEqual({ url: 'https://example.com/avatar.png' });
		expect(user2.avatar).toEqual({ url: 'https://example.com/avatar.png' });

		expect(user1.avatar).not.toBe(user2.avatar);
	});
});
