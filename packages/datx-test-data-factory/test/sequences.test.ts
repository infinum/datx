import { createTestClient } from './create-test-client';
import { createFactory, sequence } from '../src';
import { User } from './models/User';

const client = createTestClient();
const factory = createFactory(client);

describe('sequences', () => {
	beforeEach(() => {
		factory.reset();
	});

	it('should increment sequence per build', () => {
		const userFactory = factory(User, {
			fields: {
				id: sequence(),
			},
		});

		const user1 = userFactory();
		const user2 = userFactory();

		expect(user1.id).toBe(1);
		expect(user2.id).toBe(2);
	});

	it('should accept function that returns a string', () => {
		const userFactory = factory(User, {
			fields: {
				email: sequence((n) => `datx${n}@example.com`),
			},
		});

		const user = userFactory();

		expect(user.email).toBe('datx1@example.com');
	});

	it('should increment count per field', () => {
		const userFactory = factory(User, {
			fields: {
				id: sequence(),
				email: sequence((n) => `john${n}@example.com`),
			},
		});

		const user = userFactory();

		expect(user.id).toBe(1);
		expect(user.email).toBe('john1@example.com');

		const user2 = userFactory();

		expect(user2.id).toBe(2);
		expect(user2.email).toBe('john2@example.com');
	});

	it('should bea able to imperatively reset sequences', () => {
		const userFactory = factory(User, {
			fields: {
				id: sequence(),
			},
		});

		const user1 = userFactory();
		const user2 = userFactory();

		expect(user1.id).toBe(1);
		expect(user2.id).toBe(2);

		userFactory.reset();

		const user3 = userFactory();
		const user4 = userFactory();

		expect(user3.id).toBe(1);
		expect(user4.id).toBe(2);
	});
});
