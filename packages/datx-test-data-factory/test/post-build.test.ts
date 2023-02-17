import { createTestClient } from './create-test-client';
import { createFactory, perBuild } from '../src';
import { User } from './models/User';

const client = createTestClient();
const factory = createFactory(client);

describe('post build', () => {
	beforeEach(() => {
		client.reset();
	});

	it('should run postBuild transformer', () => {
		const userFactory = factory(User, {
			fields: {
				name: perBuild(() => 'John Doe'),
			},
			postBuild: (user) => {
				user.name = 'Jane Doe';

				return user;
			},
		});

		const user = userFactory();

		expect(user.name).toBe('Jane Doe');
	});

	it('should run postBuild transformer after applying overrides', () => {
		const userFactory = factory(User, {
			fields: {
				name: perBuild(() => 'John Doe'),
			},
			postBuild: (user) => {
				user.name = 'Jane Doe';

				return user;
			},
		});

		const user = userFactory({ overrides: { name: 'Joseph Doe' } });

		expect(user.name).toBe('Jane Doe');
	});

	it('should transform name to uppercase in postBuild transformer', () => {
		const userFactory = factory(User, {
			fields: {
				name: 'John Doe',
			},
			postBuild: (user) => {
				user.name = user.name.toUpperCase();

				return user;
			},
		});

		const user = userFactory();

		expect(user.name).toBe('JOHN DOE');
	});
});
