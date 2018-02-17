import {
  Collection,
  getModelCollection,
  getModelType,
  getRefId,
  initModelRef,
  Model,
  prop,
  ReferenceType,
  setRefId,
} from 'datx';
import * as fetch from 'isomorphic-fetch';

// tslint:disable:no-string-literal

import {config, fetchModelLink, GenericModel, jsonapi, modelToJsonApi, saveRelationship} from '../../src';

import {clearAllCache} from '../../src/cache';
import mockApi from '../utils/api';
import {Event, Image, Organiser, Photo, TestStore, User} from '../utils/setup';

describe('updates', () => {
  beforeEach(() => {
    config.fetchReference = fetch;
    config.baseUrl = 'http://example.com/';
    clearAllCache();
  });

  describe('adding record', () => {
    it('should add a record', async () => {
      const store = new TestStore();
      const record = new Event({
        title: 'Example title',
      });
      store.add(record);

      mockApi({
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
      expect(data.attributes.id).toBeUndefined();
      expect(data.attributes.type).toBeUndefined();

      const updated = await record.save();
      expect(updated['title']).toBe('Test 1');
      expect(updated).toBe(record);
    });

    it('should add a record if not in store', async () => {
      const record = new Event({
        title: 'Example title',
      });

      mockApi({
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
      expect(data.attributes.id).toBeUndefined();
      expect(data.attributes.type).toBeUndefined();

      const updated = await record.save();
      expect(updated['title']).toBe('Test 1');
      expect(updated).toBe(record);
    });

    it('should add a referenced record', async () => {
      class FooModel extends Event {
        public static type = 'event';
      }

      const Foo = jsonapi(FooModel);

      // tslint:disable-next-line:max-classes-per-file
      class BarModel extends Model {
        public static type = 'bar';

        @prop.toOne(Foo) public foo!: Foo;
      }

      const Bar = jsonapi(BarModel);

      // tslint:disable-next-line:max-classes-per-file
      class Test extends Collection {
        public static types = [Foo, Bar];
      }

      const store = new (jsonapi(Test))();
      const foo = new Foo({
        title: 'Example title',
      });
      store.add(foo);
      const bar = store.add<Bar>({foo}, Bar);
      const baz = store.add({}, 'baz');
      expect(bar.foo).toBe(foo);
      expect(getRefId(bar, 'foo')).toBe(foo.meta.id);

      initModelRef(baz, 'foo', {model: Foo, type: ReferenceType.TO_ONE}, foo);
      expect(baz['foo']).toBe(foo);
      expect(getRefId(baz, 'foo')).toBe(foo.meta.id);

      mockApi({
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
      expect(data.attributes.id).toBeUndefined();
      expect(data.attributes.type).toBeUndefined();

      const updated = await foo.save();
      expect(updated['title']).toBe('Test 1');
      expect(updated).toBe(foo);
      expect(foo.meta.id).toBe(12345);

      expect(getRefId(bar, 'foo')).toBe(foo.meta.id);
      expect(bar.foo).toBe(foo);

      expect(baz['foo']).toBe(foo);
      expect(getRefId(baz, 'foo')).toBe(foo.meta.id);
    });

    xit('should add a record with queue (202)', async () => {
      const store = new TestStore();
      const record = new Event({
        title: 'Example title',
      });
      store.add(record);

      mockApi({
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
      expect(data.attributes.id).toBeUndefined();
      expect(data.attributes.type).toBeUndefined();

      const queue = await record.save();
      expect(getModelType(queue)).toBe('queue');

      mockApi({
        name: 'queue-1',
        url: 'events/queue-jobs/123',
      });

      const queue2 = await fetchModelLink(queue, 'self', undefined, {skipCache: true});
      const queueRecord = queue2.data as GenericModel;
      expect(getModelType(queueRecord)).toBe('queue');

      mockApi({
        name: 'event-1',
        url: 'events/queue-jobs/123',
      });

      const updatedRes = await fetchModelLink(queue, 'self', undefined, {skipCache: true});
      const updated = updatedRes.data as Event;
      expect(updated.meta.type).toBe('event');

      expect(updated['title']).toBe('Test 1');
      expect(updated.meta.id).toBe(12345);
      expect(updated).toBe(record);
    });

    xit('should add a record with queue (202) if not in store', async () => {
      const record = new Event({
        title: 'Example title',
      });

      mockApi({
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
      expect(data.attributes.id).toBeUndefined();
      expect(data.attributes.type).toBeUndefined();

      const queue = await record.save();
      expect(getModelType(queue)).toBe('queue');

      mockApi({
        name: 'queue-1',
        url: 'events/queue-jobs/123',
      });

      const queue2 = await queue.fetchLink('self', null, true);
      const queueRecord = queue2.data as GenericModel;
      expect(queueRecord.meta.type).toBe('queue');

      mockApi({
        name: 'event-1',
        url: 'events/queue-jobs/123',
      });

      const updatedRes = await queue.fetchLink('self', null, true);
      const updated = updatedRes.data as GenericModel;
      expect(updated.meta.type).toBe('event');

      expect(updated['title']).toBe('Test 1');
      expect(updated.meta.id).toBe(12345);
      expect(updated).toBe(record);
    });

    it('should add a record with response 204', async () => {
      const store = new TestStore();
      const record = new Event({
        __meta__: {id: 123},
        title: 'Example title',
      });
      store.add(record);

      mockApi({
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
      expect(data.attributes.id).toBeUndefined();
      expect(data.attributes.type).toBeUndefined();

      const updated = await record.save();
      expect(updated['title']).toBe('Example title');
      expect(updated).toBe(record);
    });

    it('should add a record with response 204 if not in store', async () => {
      const record = new Event({
        __meta__: {id: 123},
        title: 'Example title',
      });

      mockApi({
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
      expect(data.attributes.id).toBeUndefined();
      expect(data.attributes.type).toBeUndefined();

      const updated = await record.save();
      expect(updated['title']).toBe('Example title');
      expect(updated).toBe(record);
    });

    it('should add a record with client-generated id', async () => {
      const store = new TestStore();

      // tslint:disable-next-line:max-classes-per-file
      class GenRecord extends Event {
        public static useAutogeneratedIds = true;
        public static getAutoId = () => '110ec58a-a0f2-4ac4-8393-c866d813b8d1';
      }

      const record = new GenRecord({
        title: 'Example title',
      });
      store.add(record);

      mockApi({
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
      expect(data.attributes.id).toBeUndefined();
      expect(data.attributes.type).toBeUndefined();

      const updated = await record.save();
      expect(updated['title']).toBe('Test 1');
      expect(updated).toBe(record);
    });

    it('should add a record with client-generated id if not in store', async () => {

      // tslint:disable-next-line:max-classes-per-file
      class GenRecord extends Event {
        public static useAutogeneratedIds = true;
        public static getAutoId = () => '110ec58a-a0f2-4ac4-8393-c866d813b8d1';
      }

      const record = new GenRecord({
        title: 'Example title',
      });

      mockApi({
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
      expect(data.attributes.id).toBeUndefined();
      expect(data.attributes.type).toBeUndefined();

      const updated = await record.save();
      expect(updated['title']).toBe('Test 1');
      expect(updated).toBe(record);
    });
  });

  describe('updating record', () => {
    it('should update a record', async () => {
      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new TestStore();
      const events = await store.fetch('event', 12345);

      const record = events.data as Record;

      mockApi({
        data: JSON.stringify({
          data: modelToJsonApi(record),
        }),
        method: 'PATCH',
        name: 'event-1b',
        url: 'event/12345',
      });

      const updated = await record.save();
      expect(updated['title']).toBe('Test 1');
      expect(updated).toBe(record);
    });

    it('should support updating relationships', async () => {
      mockApi({
        name: 'events-1',
        url: 'event',
      });

      const store = new TestStore();
      const events = await store.fetchAll('event');
      const event = events.data && events.data[0] as Event;

      setRefId(event, 'images', ['1', '2']);

      mockApi({
        data: {
          data: [{
            id: '1',
            type: 'image',
          }, {
            id: '2',
            type: 'image',
          }],
        },
        method: 'PATCH',
        name: 'event-1d',
        url: 'event/1/images',
      });

      expect(event).toBeInstanceOf(Event);
      if (event) {
        const event2 = await saveRelationship(event, 'images');
        expect(event2.meta.id).toBe(12345);
        expect(event2.meta.type).toBe('event');
        expect(getRefId(event2, 'images')).toHaveLength(2);
        expect(getRefId(event2, 'images')).toContain('1');
        expect(getRefId(event2, 'images')).toContain('2');
        expect(event).toBe(event2);
      }
    });
  });

  describe('removing record', () => {
    it('should remove a record', async () => {
      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new TestStore();
      const events = await store.fetch('event', 12345);

      const record = events.data as Event;

      mockApi({
        method: 'DELETE',
        name: 'event-1',
        url: 'event/12345',
      });

      expect(store.findAll('event').length).toBe(1);
      await record.destroy();
      expect(store.findAll('event').length).toBe(0);
    });

    it('should remove a record if not in store', async () => {
      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new TestStore();
      const events = await store.fetch('event', 12345);

      const record = events.data as Event;

      expect(store.findAll('event').length).toBe(1);
      store.remove(record.meta.type, record.meta.id);
      expect(store.findAll('event').length).toBe(0);

      mockApi({
        method: 'DELETE',
        name: 'event-1',
        url: 'event/12345',
      });

      await record.destroy();
      expect(store.findAll('event').length).toBe(0);
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
      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new TestStore();
      const events = await store.fetch('event', 12345);

      const record = events.data as Event;

      const req = mockApi({
        method: 'DELETE',
        name: 'event-1',
        url: 'event/12345',
      });

      expect(store.findAll('event').length).toBe(1);
      await store.remove(record.meta.type as string, record.meta.id, true);
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
      await store.remove(record.meta.type as string, record.meta.id, true);
      expect(store.findAll('event').length).toBe(0);
    });

    it('should silently remove an unexisting record', async () => {
      const store = new TestStore();

      expect(store.findAll('event').length).toBe(0);
      await store.remove('event', 1, true);
      expect(store.findAll('event').length).toBe(0);
    });
  });
});
