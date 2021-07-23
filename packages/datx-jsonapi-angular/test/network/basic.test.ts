import {
  getModelMeta,
  getModelRefMeta,
  modelToJsonApi,
  config,
  CachingStrategy,
  getModelLinks,
} from '@datx/jsonapi';

import { setRequest, setupNetwork, confirmNetwork } from '../utils/api';
import { Event, TestStore } from '../utils/setup';
import { switchMap } from 'rxjs/operators';
import { Response, IJsonapiModel } from '../../src';

const baseTransformRequest = config.transformRequest;
const baseTransformResponse = config.transformResponse;

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
    store.getMany(Event).subscribe((events) => {
      try {
        expect(events.data).toBeInstanceOf(Array);
        expect(events.data).toHaveLength(4);
        if (events.data instanceof Array) {
          const event = events.data[0];

          expect(event['title']).toBe('Test 1');
          expect(getModelMeta(event).createdAt).toBe('2017-03-19T16:00:00.000Z');
          expect(event.meta.refs.images).toBeInstanceOf(Array);
          if (event.meta.refs.images instanceof Array) {
            expect(event.meta.refs.images.map((image) => image.id)).toContain('1');
          }
          expect(event.meta.refs.images).toHaveLength(1);
          expect(getModelRefMeta(event).images.foo).toBe('bar');

          const data = modelToJsonApi(event);

          expect(data.id).toBe('1');
          expect(data.type).toBe('event');
          expect(data.attributes && data.attributes.title).toBe('Test 1');
          expect(
            data.relationships && data.relationships.images.data && data.relationships.images.data[0],
          ).toEqual({ type: 'image', id: '1' });
          expect(data.attributes && 'images' in data.attributes).toBe(false);
        }
        done();
      } catch(e) {
        done(e);
      }
    });
  });

  it('return null if no data in response', (done) => {
    setRequest({
      name: 'empty',
      url: 'event',
    });

    const store = new TestStore();
    store.getMany(Event).subscribe((events) => {
      try {
        expect(events.data).toBeNull();
        done();
      } catch(e) {
        done(e);
      }
    });
  });

  it('should fetch one item', (done) => {
    setRequest({
      name: 'event-1b',
      url: 'event/1',
    });

    const store = new TestStore();
    store.getOne(Event, '1').subscribe((events) => {
      try {
        const record = events.data;

        expect(record).toBeInstanceOf(Object);
        if (record) {
          expect(record['title']).toBe('Test 1');
          expect(getModelLinks(record)).toBeInstanceOf(Object);
          expect(getModelLinks(record).self).toBe('https://example.com/event/1234');
        }
        done();
      } catch(e) {
        done(e);
      }
    });
  });

  it('should support pagination', (done) => {
    setRequest({
      name: 'events-1',
      url: 'event',
    });

    let events;
    let events2;
    let events1;

    const store = new TestStore();
    store.getMany(Event).pipe(
      switchMap((ev) => {
        events = ev;
        expect(events.data).toBeInstanceOf(Array);
        expect(events.data).toHaveLength(4);
        if (events.data instanceof Array) {
          expect(events.data instanceof Array && events.data[0]['title']).toBe('Test 1');
          expect(events.links).toBeInstanceOf(Object);
          if (events.links instanceof Object && typeof events.links.next === 'object') {
            expect(events.links.next.href).toBe('https://example.com/event?page=2');
            expect(events.links.next.meta.foo).toBe('bar');
          }
        }

        setRequest({
          name: 'events-2',
          query: {
            page: 2,
          },
          url: 'event',
        });

        return events.next?.() as any;
      }),
      switchMap((ev2: Response<IJsonapiModel>) => {
        events2 = ev2;
        expect(events2).toBeInstanceOf(Object);
        if (events2) {
          expect(events2.data).toBeInstanceOf(Array);
          expect(events2.data).toHaveLength(2);
          expect(events2.data instanceof Array && events2.data[0]['title']).toBe('Test 5');

          setRequest({
            name: 'events-1',
            url: 'event',
          });

          return events2.prev?.() as any;
        }
      }),
      switchMap((ev1: Response<IJsonapiModel>) => {
        events1 = ev1;
        expect(events1).toBeInstanceOf(Object);
        if (events1) {
          expect(events1.data).toBeInstanceOf(Array);
          expect(events1.data).toHaveLength(4);
          expect(events1.data instanceof Array && events1.data[0]['title']).toBe('Test 1');

          setRequest({
            name: 'events-1',
            url: 'event',
          });

          return events2.prev?.() as any;
        }
      }),
    ).subscribe((events1b: Response<IJsonapiModel>) => {
      try {
        expect(events1.snapshot).toEqual(events.snapshot);
        expect(events1.snapshot).toEqual(events1b?.snapshot);
        done();
      } catch(e) {
        done(e);
      }
    });
  });
});
