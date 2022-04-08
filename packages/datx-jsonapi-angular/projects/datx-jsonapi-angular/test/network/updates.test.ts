import { getModelCollection } from '@datx/core';
import { modelToJsonApi, config, CachingStrategy } from '@datx/jsonapi';
import { switchMap } from 'rxjs/operators';

import { setupNetwork, setRequest, confirmNetwork } from '../utils/api';
import { Event, TestStore } from '../utils/setup';
import { IJsonapiModel, Response } from '../../src/public-api';
import { Observable, throwError } from 'rxjs';

describe('updates', () => {
  beforeEach(() => {
    config.baseUrl = 'https://example.com/';
    config.cache = CachingStrategy.NetworkOnly;
    setupNetwork();
  });

  afterEach(confirmNetwork);

  describe('adding record', () => {
    it('should add a record', (done) => {
      const store = new TestStore();
      const record = new Event({
        title: 'Example title',
      });

      store.add(record);

      setRequest({
        data: JSON.stringify({
          data: modelToJsonApi(record as any),
        }),
        method: 'POST',
        name: 'event-1',
        url: 'event',
      });

      const data = modelToJsonApi(record as any);

      expect(record['title']).toBe('Example title');
      expect(data.id).toBeUndefined();
      expect(data.type).toBe('event');
      expect(data.attributes && data.attributes['id']).toBeUndefined();
      expect(data.attributes && data.attributes['type']).toBeUndefined();
      expect(getModelCollection(record)).toBe(store);

      record.save().subscribe((updated) => {
        try {
          expect((updated as any)['title']).toBe('Test 1');
          expect(updated).toBe(record);
          expect(getModelCollection(record)).toBe(store);
          done();
        } catch (e) {
          done.fail(e as Error);
        }
      });
    });

    it('should add a record if not in store', (done) => {
      const record = new Event({
        title: 'Example title',
      });

      setRequest({
        data: JSON.stringify({
          data: modelToJsonApi(record as any),
        }),
        method: 'POST',
        name: 'event-1',
        url: 'event',
      });

      const data = modelToJsonApi(record as any);

      expect(record['title']).toBe('Example title');
      expect(data.id).toBeUndefined();
      expect(data.type).toBe('event');
      expect(data.attributes && data.attributes['id']).toBeUndefined();
      expect(data.attributes && data.attributes['type']).toBeUndefined();

      record.save().subscribe((updated) => {
        try {
          expect(updated['title']).toBe('Test 1');
          expect(updated).toBe(record);
          done();
        } catch (e) {
          done.fail(e as Error);
        }
      });
    });
  });

  describe('updating record', () => {
    it('should update a record', (done) => {
      setRequest({
        name: 'event-1',
        url: 'event/12345',
      });

      let record: {
        title: string;
        meta: { dirty: { title: boolean } };
        save: () => Observable<IJsonapiModel>;
      };

      const store = new TestStore();
      store
        .getOne('event', '12345')
        .pipe(
          switchMap((events: Response<Event>) => {
            record = events.data;

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

              return record.save();
            }
            return throwError(new Error('Wrong path'));
          }),
        )
        .subscribe((updated) => {
          try {
            expect(record.meta.dirty.title).toBe(false);
            expect((updated as any)['title']).toBe('Test 1');
            expect(updated).toBe(record);
            done();
          } catch (e) {
            done.fail(e as Error);
          }
        });
    });
  });

  describe('removing record', () => {
    it('should remove a record', (done) => {
      setRequest({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new TestStore();

      store.add({ id: '1' }, Event);
      store
        .getOne(Event, '12345')
        .pipe(
          switchMap((events) => {
            store.add({ id: '2' }, Event);

            const record = events.data as Event;

            setRequest({
              method: 'DELETE',
              name: 'event-1',
              url: 'event/12345',
            });

            expect(store.findAll(Event).length).toBe(3);
            return record.destroy();
          }),
        )
        .subscribe(() => {
          try {
            const remainingEvents = store.findAll(Event);
            expect(remainingEvents.length).toBe(2);

            expect(remainingEvents[0] && remainingEvents[0].meta.id).toBe('1');
            expect(remainingEvents[1] && remainingEvents[1].meta.id).toBe('2');
            done();
          } catch (e) {
            done.fail(e as Error);
          }
        });
    });

    it('should remove a record from store', (done) => {
      setRequest({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new TestStore();

      store.add({ id: '1' }, Event);
      store
        .getOne(Event, '12345')
        .pipe(
          switchMap((events) => {
            store.add({ id: '2' }, Event);

            const record = events.data as Event;

            setRequest({
              method: 'DELETE',
              name: 'event-1',
              url: 'event/12345',
            });

            expect(store.findAll(Event).length).toBe(3);
            return store.removeOne(record, true);
          }),
        )
        .subscribe(() => {
          try {
            const remainingEvents = store.findAll(Event);
            expect(remainingEvents.length).toBe(2);

            expect(remainingEvents[0] && remainingEvents[0].meta.id).toBe('1');
            expect(remainingEvents[1] && remainingEvents[1].meta.id).toBe('2');
            done();
          } catch (e) {
            done.fail(e as Error);
          }
        });
    });
  });
});
