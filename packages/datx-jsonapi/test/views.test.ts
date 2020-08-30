import { View, IViewConstructor, PureModel } from 'datx';
import * as fetch from 'isomorphic-fetch';

import { IJsonapiView, jsonapi, config } from '../src';
import { setupNetwork, setRequest, confirmNetwork } from './utils/api';
import { Event, TestStore } from './utils/setup';
import { clearAllCache } from '../src/cache';

const baseTransformRequest = config.transformRequest;
const baseTransformResponse = config.transformResponse;

describe('Views', () => {
  it('should sync an event', () => {
    const store = new TestStore();
    const JsonapiView = jsonapi(View as IViewConstructor<PureModel>);
    const view = new JsonapiView(Event, store);

    const event = view.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: '1',
        type: 'event',
      },
    }) as Event;

    expect(event.name).toBe('Demo');
    expect(view.length).toBe(1);
  });

  describe('Network basics', () => {
    beforeEach(() => {
      config.fetchReference = fetch;
      config.baseUrl = 'https://example.com/';
      config.transformRequest = baseTransformRequest;
      config.transformResponse = baseTransformResponse;
      clearAllCache();
      setupNetwork();
    });

    afterEach(confirmNetwork);

    it('should fetch the basic data', async () => {
      setRequest({
        name: 'events-1',
        url: 'event',
      });

      const store = new TestStore();
      const JsonapiView = jsonapi(View as IViewConstructor<PureModel>);
      const view = new JsonapiView(Event, store);
      const events = await view.getMany();

      expect(events.data).toBeInstanceOf(Array);
      expect(events.data).toHaveLength(4);
      expect(view.length).toBe(4);
    });

    it('should support pagination', async () => {
      setRequest({
        name: 'events-1',
        url: 'event',
      });

      const store = new TestStore();
      const JsonapiView = jsonapi(View as IViewConstructor<PureModel>);
      const view = new JsonapiView(Event, store);
      const events = await view.getMany();

      expect(events.data).toBeInstanceOf(Array);
      expect(events.data).toHaveLength(4);
      expect(view.length).toBe(4);

      setRequest({
        name: 'events-2',
        query: {
          page: 2,
        },
        url: 'event',
      });

      const events2 = await events.next?.();

      expect(events2).toBeInstanceOf(Object);
      if (events2) {
        expect(events2.data).toBeInstanceOf(Array);
        expect(events2.data).toHaveLength(2);
        expect(view.length).toBe(6);
      }
    });

    it('should support collection views with mixins', async () => {
      setRequest({
        name: 'events-1',
        url: 'event',
      });

      class NewStore extends TestStore {
        public static views = {
          test: {
            mixins: [jsonapi],
            modelType: Event,
          },
        };

        public test!: IJsonapiView;
      }

      const store = new NewStore();
      const events = await store.test.getMany();

      expect(events.data).toBeInstanceOf(Array);
      expect(events.data).toHaveLength(4);
      expect(store.test.length).toBe(4);

      setRequest({
        name: 'events-2',
        query: {
          page: 2,
        },
        url: 'event',
      });

      const events2 = await events.next?.();

      expect(events2).toBeInstanceOf(Object);
      if (events2) {
        expect(events2.data).toBeInstanceOf(Array);
        expect(events2.data).toHaveLength(2);
        expect(store.test.length).toBe(6);
      }
    });
  });
});
