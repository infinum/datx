import {
  Collection,
  getModelCollection,
  getModelId,
  getModelType,
  initModelRef,
  Model,
  prop,
  ReferenceType,
} from '@datx/core';
import fetch from 'isomorphic-fetch';

import {
  fetchModelLink,
  jsonapiModel,
  jsonapiCollection,
  modelToJsonApi,
  saveRelationship,
  config,
} from '../../src';
import { clearAllCache } from '../../src/cache';

import { setupNetwork, setRequest, confirmNetwork } from '../utils/api';
import { Event, TestStore } from '../utils/setup';

describe('updates', () => {
  beforeEach(() => {
    config.fetchReference = fetch;
    config.baseUrl = 'https://example.com/';
    config.usePatchWhenPossible = true;
    clearAllCache();
    setupNetwork();
  });

  afterEach(confirmNetwork);

  describe('adding record', () => {
    it('should add a record', async () => {
      const store = new TestStore();
      const record = new Event({
        title: 'Example title',
      });

      store.add(record);

      setRequest({
        data: JSON.stringify({
          data: modelToJsonApi(record),
        }),
        method: 'POST',
        name: 'event-1',
        url: 'event',
      });

      const data = modelToJsonApi(record);

      expect(record['title']).toBe('Example title');
      expect(data.id).toBeUndefined();
      expect(data.type).toBe('event');
      expect(data.attributes && data.attributes.id).toBeUndefined();
      expect(data.attributes && data.attributes.type).toBeUndefined();
      expect(getModelCollection(record)).toBe(store);

      const updated = await record.save();

      expect(getModelCollection(record)).toBe(store);
      expect(updated['title']).toBe('Test 1');
      expect(updated).toBe(record);
    });

    it('should add a record if not in store', async () => {
      const record = new Event({
        title: 'Example title',
      });

      setRequest({
        data: JSON.stringify({
          data: modelToJsonApi(record),
        }),
        method: 'POST',
        name: 'event-1',
        url: 'event',
      });

      const data = modelToJsonApi(record);

      expect(record['title']).toBe('Example title');
      expect(data.id).toBeUndefined();
      expect(data.type).toBe('event');
      expect(data.attributes && data.attributes.id).toBeUndefined();
      expect(data.attributes && data.attributes.type).toBeUndefined();

      const updated = await record.save();

      expect(updated['title']).toBe('Test 1');
      expect(updated).toBe(record);
    });

    it('should add a referenced record', async () => {
      class Foo extends jsonapiModel(Event) {
        public static type = 'event';

        @prop.identifier
        public id!: string;
      }

      class Bar extends jsonapiModel(Model) {
        public static type = 'bar';

        @prop.toOne(Foo)
        public foo!: Foo;
      }

      class Test extends Collection {
        public static types = [Foo, Bar];
      }

      const store = new (jsonapiCollection(Test))();
      const foo = new Foo({
        title: 'Example title',
      });

      store.add(foo);
      const bar = store.add<Bar>({ foo }, Bar);
      const baz = store.add({}, 'baz');

      expect(bar.foo).toBe(foo);
      const barRef = bar.foo;

      if (barRef && 'id' in barRef) {
        expect(barRef.id).toBe(foo.meta.id);
      } else {
        expect(true).toBe(false);
      }

      initModelRef(baz, 'foo', { model: Foo.type, type: ReferenceType.TO_ONE }, foo);
      expect(baz['foo']).toBe(foo);

      const bazRef = baz['foo'];

      if (bazRef && 'id' in bazRef) {
        expect(bazRef.id).toBe(foo.meta.id);
      } else {
        expect(true).toBe(false);
      }

      setRequest({
        data: JSON.stringify({
          data: modelToJsonApi(foo),
        }),
        method: 'POST',
        name: 'event-1',
        url: 'event',
      });

      const data = modelToJsonApi(foo);

      expect(foo['title']).toBe('Example title');
      expect(data.id).toBeUndefined();
      expect(data.type).toBe('event');
      expect(data.attributes && data.attributes.id).toBeUndefined();
      expect(data.attributes && data.attributes.type).toBeUndefined();

      const updated = await foo.save();

      expect(updated['title']).toBe('Test 1');
      expect(updated).toBe(foo);
      expect(foo.meta.id).toBe('12345');

      const barRef2 = bar.foo;

      if (barRef2 && 'id' in barRef2) {
        expect(barRef2.id).toBe(foo.meta.id);
      } else {
        expect(true).toBe(false);
      }
      expect(bar.foo).toBe(foo);

      expect(baz['foo']).toBe(foo);
      const bazRef2 = baz['foo'];

      if (bazRef2 && 'id' in bazRef2) {
        expect(bazRef2.id).toBe(foo.meta.id);
      } else {
        expect(true).toBe(false);
      }
    });

    it('should add a record with queue (202)', async () => {
      const store = new TestStore();
      const record = new Event({
        title: 'Example title',
      });

      store.add(record);

      setRequest({
        data: JSON.stringify({
          data: modelToJsonApi(record),
        }),
        method: 'POST',
        name: 'queue-1',
        status: 202,
        url: 'event',
      });

      const data = modelToJsonApi(record);

      expect(record['title']).toBe('Example title');
      expect(data.id).toBeUndefined();
      expect(data.type).toBe('event');
      expect(data.attributes && data.attributes.id).toBeUndefined();
      expect(data.attributes && data.attributes.type).toBeUndefined();

      const queue = await record.save();

      expect(getModelType(queue)).toBe('queue');

      setRequest({
        name: 'queue-1',
        url: 'events/queue-jobs/123',
      });

      const queue2 = await fetchModelLink(queue, 'self', { cacheOptions: { skipCache: true } });
      const queueRecord = queue2.data;

      expect(queueRecord).not.toBeNull();
      if (queueRecord) {
        expect(getModelType(queueRecord)).toBe('queue');
      }

      setRequest({
        name: 'event-1',
        url: 'events/queue-jobs/123',
      });

      const updatedRes = await fetchModelLink(queue, 'self', { cacheOptions: { skipCache: true } });
      const updated = updatedRes.data as Event;

      expect(updated.meta.type).toBe('event');

      expect(updated['title']).toBe('Test 1');
      expect(updated.meta.id).toBe('12345');
      expect(updated).toBe(record);
    });

    it('should add a record with queue (202) if not in store', async () => {
      const record = new Event({
        title: 'Example title',
      });
      // const store = new TestStore();
      // store.add(record);

      setRequest({
        data: JSON.stringify({
          data: modelToJsonApi(record),
        }),
        method: 'POST',
        name: 'queue-1',
        status: 202,
        url: 'event',
      });

      const data = modelToJsonApi(record);

      expect(record['title']).toBe('Example title');
      expect(data.id).toBeUndefined();
      expect(data.type).toBe('event');
      expect(data.attributes && data.attributes.id).toBeUndefined();
      expect(data.attributes && data.attributes.type).toBeUndefined();

      const queue = await record.save();

      expect(getModelType(queue)).toBe('queue');

      setRequest({
        name: 'queue-1',
        url: 'events/queue-jobs/123',
      });

      const queue2 = await fetchModelLink(queue, 'self', { cacheOptions: { skipCache: true } });
      const queueRecord = queue2.data;

      expect(queueRecord).not.toBeNull();
      if (queueRecord) {
        expect(getModelType(queueRecord)).toBe('queue');
      }

      setRequest({
        name: 'event-1',
        url: 'events/queue-jobs/123',
      });

      const updatedRes = await fetchModelLink(queue, 'self', { cacheOptions: { skipCache: true } });
      const updated = updatedRes.data;

      expect(updated).not.toBeNull();
      if (updated) {
        expect(getModelType(updated)).toBe('event');

        expect(updated['title']).toBe('Test 1');
        expect(getModelId(updated)).toBe('12345');
        expect(updated).toBe(record);
      }
    });

    it('should add a record with response 204', async () => {
      const store = new TestStore();
      const record = new Event({
        __meta__: { id: 123 },
        title: 'Example title',
      });

      store.add(record);

      setRequest({
        data: JSON.stringify({
          data: modelToJsonApi(record),
        }),
        method: 'POST',
        responseFn: () => null,
        status: 204,
        url: 'event',
      });

      const data = modelToJsonApi(record);

      expect(record['title']).toBe('Example title');
      expect(data.type).toBe('event');
      expect(data.attributes && data.attributes.id).toBeUndefined();
      expect(data.attributes && data.attributes.type).toBeUndefined();

      const updated = await record.save();

      expect(updated['title']).toBe('Example title');
      expect(updated).toBe(record);
    });

    it('should add a record with response 204 if not in store', async () => {
      const record = new Event({
        __meta__: { id: 123 },
        title: 'Example title',
      });

      setRequest({
        data: JSON.stringify({
          data: modelToJsonApi(record),
        }),
        method: 'POST',
        responseFn: () => null,
        status: 204,
        url: 'event',
      });

      const data = modelToJsonApi(record);

      expect(record['title']).toBe('Example title');
      expect(data.type).toBe('event');
      expect(data.attributes && data.attributes.id).toBeUndefined();
      expect(data.attributes && data.attributes.type).toBeUndefined();

      const updated = await record.save();

      expect(updated['title']).toBe('Example title');
      expect(updated).toBe(record);
    });

    it('should add a record with client-generated id', async () => {
      const store = new TestStore();

      class GenRecord extends Event {
        public static useAutogeneratedIds = true;

        public static getAutoId = (): string => '110ec58a-a0f2-4ac4-8393-c866d813b8d1';
      }

      const record = new GenRecord({
        title: 'Example title',
      });

      store.add(record);

      setRequest({
        data: JSON.stringify({
          data: modelToJsonApi(record),
        }),
        method: 'POST',
        name: 'event-1c',
        url: 'event',
      });

      const data = modelToJsonApi(record);

      expect(record['title']).toBe('Example title');
      expect(typeof data.id).toBe('string');
      expect(data.id).toHaveLength(36);
      expect(data.type).toBe('event');
      expect(data.attributes && data.attributes.id).toBeUndefined();
      expect(data.attributes && data.attributes.type).toBeUndefined();

      const updated = await record.save();

      expect(updated['title']).toBe('Test 1');
      expect(updated).toBe(record);
    });

    it('should add a record with client-generated id if not in store', async () => {
      class GenRecord extends Event {
        public static useAutogeneratedIds = true;

        public static getAutoId = (): string => '110ec58a-a0f2-4ac4-8393-c866d813b8d1';
      }

      const record = new GenRecord({
        title: 'Example title',
      });

      setRequest({
        data: JSON.stringify({
          data: modelToJsonApi(record),
        }),
        method: 'POST',
        name: 'event-1c',
        url: 'event',
      });

      const data = modelToJsonApi(record);

      expect(record['title']).toBe('Example title');
      expect(typeof data.id).toBe('string');
      expect(data.id).toHaveLength(36);
      expect(data.type).toBe('event');
      expect(data.attributes && data.attributes.id).toBeUndefined();
      expect(data.attributes && data.attributes.type).toBeUndefined();

      const updated = await record.save();

      expect(updated['title']).toBe('Test 1');
      expect(updated).toBe(record);
    });
  });

  describe('updating record', () => {
    it('should update a record', async () => {
      setRequest({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new TestStore();
      const events = await store.fetch('event', '12345');

      const record = events.data;

      expect(record).toBeInstanceOf(Event);
      if (record instanceof Event) {
        setRequest({
          data: JSON.stringify({
            data: {
              attributes: {
                title: 'Updated title',
              },
              id: '12345',
              type: 'event',
              relationships: {
                organizers: { data: [] },
                images: { data: [] },
                image: { data: null },
              },
            },
          }),
          method: 'PATCH',
          name: 'event-1b',
          url: 'event/12345',
        });

        record.title = 'Updated title';
        expect(record.meta.dirty.title).toBe(true);

        const updated = await record.save();

        expect(record.meta.dirty.title).toBe(false);
        expect(updated['title']).toBe('Test 1');
        expect(updated).toBe(record);
      }
    });
    it('should update a record with put', async () => {
      config.usePatchWhenPossible = false;

      setRequest({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new TestStore();
      const events = await store.fetch('event', '12345');

      const record = events.data;

      expect(record).toBeInstanceOf(Event);
      if (record instanceof Event) {
        setRequest({
          data: JSON.stringify({
            data: {
              attributes: {
                title: 'Updated title',
                date: '2017-03-19',
              },
              id: '12345',
              type: 'event',
              relationships: {
                organizers: { data: [] },
                images: { data: [] },
                image: { data: null },
              },
            },
          }),
          method: 'PUT',
          name: 'event-1b',
          url: 'event/12345',
        });

        record.title = 'Updated title';
        expect(record.meta.dirty.title).toBe(true);

        const updated = await record.save();

        expect(record.meta.dirty.title).toBe(false);
        expect(updated['title']).toBe('Test 1');
        expect(updated).toBe(record);
      }
    });

    it('should support updating relationships', async () => {
      setRequest({
        name: 'events-1',
        url: 'event',
      });

      const store = new TestStore();
      const events = await store.fetchAll('event');
      const event = events.data && (events.data[0] as Event);

      expect(event).toBeInstanceOf(Event);
      if (event) {
        event.images = [
          // @ts-ignore
          { type: 'image', id: '1' },
          // @ts-ignore
          { type: 'image', id: '2' },
        ];

        store.sync({
          data: [
            { id: '1', type: 'image' },
            { id: '2', type: 'image' },
          ],
        });

        setRequest({
          data: {
            data: [
              {
                id: '1',
                type: 'image',
              },
              {
                id: '2',
                type: 'image',
              },
            ],
          },
          method: 'PATCH',
          name: 'event-1d',
          url: 'event/1/images',
        });

        const event2 = await saveRelationship(event, 'images');

        expect(event2.meta.id).toBe('12345');
        expect(event2.meta.type).toBe('event');
        const { images } = event2;

        expect(images).toHaveLength(2);
        if (images instanceof Array) {
          expect(images.map((image) => image.id)).toContain('1');
          expect(images.map((image) => image.id)).toContain('2');
        }
        expect(event).toBe(event2);
      }
    });
  });

  describe('removing record', () => {
    it('should remove a record', async () => {
      setRequest({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new TestStore();

      store.add({ id: '1' }, Event);
      const events = await store.fetch('event', '12345');

      store.add({ id: '2' }, Event);

      const record = events.data as Event;

      setRequest({
        method: 'DELETE',
        name: 'event-1',
        url: 'event/12345',
      });

      expect(store.findAll('event').length).toBe(3);
      await record.destroy();
      expect(store.findAll('event').length).toBe(2);
      const remainingEvents = store.findAll(Event);

      expect(remainingEvents[0] && remainingEvents[0].meta.id).toBe('1');
      expect(remainingEvents[1] && remainingEvents[1].meta.id).toBe('2');
    });

    it('should remove a record if not in store', async () => {
      setRequest({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new TestStore();
      const events = await store.fetch(Event, '12345');

      const record = events.data as Event;

      expect(store.findAll(Event)).toHaveLength(1);
      store.removeOne(record.meta.type, record.meta.id);
      expect(store.findAll(Event)).toHaveLength(0);

      setRequest({
        method: 'DELETE',
        name: 'event-1',
        url: 'event/12345',
        responseFn: () => null,
        status: 204,
      });

      await record.destroy();
      expect(store.findAll(Event)).toHaveLength(0);
    });

    it('should remove a local record without api calls', async () => {
      const store = new TestStore();
      const record = new Event({
        title: 'Example title',
      });

      store.add(record);

      expect(record['title']).toBe('Example title');

      expect(store.findAll('event').length).toBe(1);
      await record.destroy();
      expect(store.findAll('event').length).toBe(0);
    });

    it('should remove a record from the store', async () => {
      setRequest({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new TestStore();
      const events = await store.fetch('event', '12345');

      const record = events.data as Event;

      const req = setRequest({
        method: 'DELETE',
        name: 'event-1',
        url: 'event/12345',
      });

      expect(store.findAll('event').length).toBe(1);
      await store.removeOne(record.meta.type as string, record.meta.id as string, true);
      expect(store.findAll('event').length).toBe(0);
      expect(req.isDone()).toBe(true);
    });

    it('should remove a local record from store without api calls', async () => {
      const store = new TestStore();
      const record = new Event({
        title: 'Example title',
      });

      store.add(record);

      expect(record['title']).toBe('Example title');

      expect(store.findAll('event').length).toBe(1);
      await store.removeOne(record.meta.type as string, record.meta.id as string, true);
      expect(store.findAll('event').length).toBe(0);
    });

    it('should silently remove an unexisting record', async () => {
      const store = new TestStore();

      expect(store.findAll('event').length).toBe(0);
      await store.removeOne('event', '1', true);
      expect(store.findAll('event').length).toBe(0);
    });
  });
});
