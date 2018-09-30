import {Event, TestStore} from './utils/setup';

describe('Issues', () => {
  it('should handle models without attributes (#78)', () => {
    const store = new TestStore();
    const event = store.sync({
      data: {
        id: 1,
        type: 'event',
      },
    }) as Event;

    expect(event.name).toBe(undefined);
    expect(event.meta.id).toBe(1);
  });
});
