import { Collection, Model, prop, Attribute } from '@datx/core';
import { mobx } from '@datx/utils';
import * as fetch from 'isomorphic-fetch';
import { getModelMeta, getModelRefMeta, jsonapi, modelToJsonApi, config } from '../src';

import { setupNetwork, setRequest, confirmNetwork } from './utils/api';
import { Event, LineItem, TestStore } from './utils/setup';
import { clearAllCache } from '../src/cache';

describe('Issues', () => {
  beforeEach(() => {
    config.fetchReference = fetch;
    config.baseUrl = 'https://example.com/';
    clearAllCache();
    setupNetwork();
  });

  afterEach(confirmNetwork);

  it('should handle models without attributes (#78)', () => {
    const store = new TestStore();
    const event = store.sync({
      data: {
        id: '1',
        type: 'event',
      },
    }) as Event;

    expect(event.name).toBe(undefined);
    expect(event.meta.id).toBe('1');
  });

  describe('should handle server response with null reference (#47)', () => {
    it('should remove the reference if null', async () => {
      class ImageRecord extends jsonapi(Model) {
        public static type = 'image';

        @prop
        public name!: string;

        @prop
        public event!: Array<EventRecord>;
      }

      class EventRecord extends jsonapi(Model) {
        public static type = 'event';

        @prop.toOneOrMany(ImageRecord)
        public image!: ImageRecord | Array<ImageRecord>;
      }

      class ApiStore extends jsonapi(Collection) {
        public static types = [ImageRecord, EventRecord];

        @mobx.computed
        get image(): Array<ImageRecord> {
          return this.findAll(ImageRecord);
        }
      }

      const store = new ApiStore();

      setRequest({
        name: 'issue-47a',
        url: 'event/1',
      });

      const response = await store.fetch('event', '1');
      const event = response.data as EventRecord;

      expect(event.image).toBe(store.image[0]);

      setRequest({
        name: 'issue-47b',
        url: 'event/1',
      });
      await store.fetch('event', '1', { cacheOptions: { skipCache: true } });
      expect(event.image).toBe(null);

      setRequest({
        name: 'issue-47a',
        url: 'event/1',
      });
      await store.fetch('event', '1', { cacheOptions: { skipCache: true } });
      expect(event.image).toBe(store.image[0]);

      setRequest({
        name: 'issue-47d',
        url: 'event/1',
      });
      await store.fetch('event', '1', { cacheOptions: { skipCache: true } });
      expect(event.image['length']).toBe(1);
      expect(event.image[0]).toBe(store.image[1]);

      setRequest({
        name: 'issue-47e',
        url: 'event/1',
      });
      await store.fetch('event', '1', { cacheOptions: { skipCache: true } });
      expect(event.image['length']).toBe(0);
    });

    it('should update the reference if not null', async () => {
      class ImageRecord extends jsonapi(Model) {
        public static type = 'image';

        @prop
        public name!: string;

        @prop
        public event!: Array<EventRecord>;
      }

      class EventRecord extends jsonapi(Model) {
        public static type = 'event';

        @prop.toOneOrMany(ImageRecord)
        public image!: ImageRecord | Array<ImageRecord>;
      }

      class ApiStore extends jsonapi(Collection) {
        public static types = [ImageRecord, EventRecord];

        @mobx.computed
        get image(): Array<ImageRecord> {
          return this.findAll(ImageRecord);
        }
      }

      const store = new ApiStore();

      setRequest({
        name: 'issue-47a',
        url: 'event/1',
      });
      const response = await store.fetch('event', '1');
      const event = response.data as EventRecord;

      expect(event.image).toBe(store.image[0]);

      setRequest({
        name: 'issue-47c',
        url: 'event/1',
      });
      await store.fetch('event', '1', { cacheOptions: { skipCache: true } });
      expect(event.image).toBe(store.image[1]);

      setRequest({
        name: 'issue-47a',
        url: 'event/1',
      });
      await store.fetch('event', '1', { cacheOptions: { skipCache: true } });
      expect(event.image).toBe(store.image[0]);
    });
  });

  it('should update the meta on model update', async () => {
    const store = new TestStore();

    setRequest({
      name: 'event-1d',
      url: 'event/1',
    });
    const response1 = await store.fetch('event', '1');
    const event1 = response1.data as Event;
    const meta1 = getModelMeta(event1);
    const refMeta1 = getModelRefMeta(event1);

    expect(meta1.name).toBe('event-1d');
    expect(refMeta1.images.foo).toBe('bar');

    setRequest({
      name: 'event-1e',
      url: 'event/1',
    });

    const response2 = await store.fetch('event', '1', { cacheOptions: { skipCache: true } });
    const event2 = response2.data as Event;
    const meta2 = getModelMeta(event2);
    const refMeta2 = getModelRefMeta(event2);

    expect(meta2.name).toBe('event-1e');
    expect(refMeta2.images.foo).toBe('baz');

    expect(event1).toBe(event2);
  });

  it('should remove a reference when the model is destroyed', async () => {
    const store = new TestStore();

    setRequest({
      name: 'event-1f',
      url: 'event/1',
    });

    const eventResp = await store.fetch(Event, '1');
    const event = eventResp.data as Event;

    expect(event.images).toHaveLength(2);

    const toRemove = event.images[0];

    setRequest({
      method: 'DELETE',
      responseFn: () => null,
      status: 204,
      url: 'image/1',
    });

    await toRemove.destroy();
    expect(event.images).toHaveLength(1);
  });

  it('should not exceed maximum call stack', async () => {
    const store = new TestStore();

    setRequest({
      method: 'POST',
      name: 'issue-maximum-call-stack-exceeded-b',
      url: 'line_items',
    });

    const lineItem1 = new LineItem({}, store);

    await lineItem1.save();

    setRequest({
      method: 'POST',
      name: 'issue-maximum-call-stack-exceeded-c',
      url: 'line_items',
    });

    const lineItem2 = new LineItem({}, store);

    await lineItem2.save();
  });

  it('should serialize the right relationships', () => {
    class Foo extends jsonapi(Model) {
      public static type = 'foo';

      @Attribute({ toOne: 'bar' })
      public bar!: Bar;

      @Attribute({ toMany: 'bar', referenceProperty: 'foo' })
      public bars!: Array<Bar>;
    }

    class Bar extends jsonapi(Model) {
      public static type = 'bar';

      @Attribute({ toOne: 'foo' })
      public foo!: Foo;
    }

    class Store extends jsonapi(Collection) {
      public static types = [Foo, Bar];
    }

    const store = new Store();

    const bar1 = store.add({}, Bar);
    const foo1 = store.add({ bar: bar1 }, Foo);
    bar1.foo = foo1;

    expect(foo1.bars).toEqual([bar1]);

    const jsonapiData = modelToJsonApi(foo1);
    expect(jsonapiData.relationships?.bar).toEqual({ data: { id: bar1.meta.id, type: 'bar' } });
    expect(jsonapiData.relationships?.bars).toBeUndefined();
  });
});
