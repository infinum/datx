import { createTestClient } from './create-test-client';
import { createFactory, sequence } from '../src';
import { User } from './models/User';

describe('factory', () => {
	it('should create a factory', () => {
		const client = createTestClient();
		const factory = createFactory(client);
		const userFactory = factory(User, {
			fields: {
				id: sequence(),
			},
		});
		const user = userFactory();

		expect(user.id).toBe(1);
	});

	it('should reset client on factory reset', () => {
		const client = createTestClient();
		const factory = createFactory(client);
		const userFactory = factory(User, {
			fields: {
				id: sequence(),
			},
		});

		userFactory();
		userFactory();

		expect(client.findAll(User).length).toBe(2);

		factory.reset();

		userFactory();

		expect(client.findAll(User).length).toBe(1);
	});
});
