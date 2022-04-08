import { View, IViewConstructor, PureModel } from '@datx/core';

import { jsonapiAngular } from '../src/public-api';
import { setupNetwork, setRequest, confirmNetwork } from './utils/api';
import { Event, TestStore } from './utils/setup';
import { config, CachingStrategy } from '@datx/jsonapi';

const baseTransformRequest = config.transformRequest;
const baseTransformResponse = config.transformResponse;

describe('Views', () => {
  it('should sync an event', () => {
    const store = new TestStore();
    const JsonapiView = jsonapiAngular(View as IViewConstructor<PureModel>);
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
      config.baseUrl = 'https://example.com/';
      config.transformRequest = baseTransformRequest;
      config.transformResponse = baseTransformResponse;
      config.cache = CachingStrategy.NetworkOnly;
      setupNetwork();
    });

    afterEach(confirmNetwork);

    it('should fetch the basic data', (done) => {
      setRequest({
        name: 'events-1',
        url: 'event',
      });

      const store = new TestStore();
      const JsonapiView = jsonapiAngular(View as IViewConstructor<PureModel>);
      const view = new JsonapiView(Event, store);
      view.getMany().subscribe((events) => {
        try {
          expect(events.data).toBeInstanceOf(Array);
          expect(events.data).toHaveLength(4);
          expect(view.length).toBe(4);
          done();
        } catch (e) {
          done.fail(e as Error);
        }
      });
    });

    // it('should support pagination', async () => {
    //   setRequest({
    //     name: 'events-1',
    //     url: 'event',
    //   });

    //   const store = new TestStore();
    //   const JsonapiView = jsonapiAngular(View as IViewConstructor<PureModel>);
    //   const view = new JsonapiView(Event, store);
    //   const events = await view.getMany();

    //   expect(events.data).toBeInstanceOf(Array);
    //   expect(events.data).toHaveLength(4);
    //   expect(view.length).toBe(4);

    //   setRequest({
    //     name: 'events-2',
    //     query: {
    //       page: 2,
    //     },
    //     url: 'event',
    //   });

    //   const events2 = await events.next?.();

    //   expect(events2).toBeInstanceOf(Object);
    //   if (events2) {
    //     expect(events2.data).toBeInstanceOf(Array);
    //     expect(events2.data).toHaveLength(2);
    //     expect(view.length).toBe(6);
    //   }
    // });

    // it('should support collection views with mixins', async () => {
    //   setRequest({
    //     name: 'events-1',
    //     url: 'event',
    //   });

    //   class NewStore extends TestStore {
    //     public static views = {
    //       test: {
    //         mixins: [jsonapiAngular],
    //         modelType: Event,
    //       },
    //     };

    //     public test!: IJsonapiView;
    //   }

    //   const store = new NewStore();
    //   const events = await store.test.getMany();

    //   expect(events.data).toBeInstanceOf(Array);
    //   expect(events.data).toHaveLength(4);
    //   expect(store.test.length).toBe(4);

    //   setRequest({
    //     name: 'events-2',
    //     query: {
    //       page: 2,
    //     },
    //     url: 'event',
    //   });

    //   const events2 = await events.next?.();

    //   expect(events2).toBeInstanceOf(Object);
    //   if (events2) {
    //     expect(events2.data).toBeInstanceOf(Array);
    //     expect(events2.data).toHaveLength(2);
    //     expect(store.test.length).toBe(6);
    //   }
    // });
  });
});
