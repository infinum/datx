// tslint:disable:max-classes-per-file
import {Collection, Model, prop} from 'datx';
import * as fetch from 'isomorphic-fetch';
import {computed} from 'mobx';
import {config, jsonapi} from '../src';
import {clearAllCache} from '../src/cache';

import mockApi from './utils/api';
import {Event, TestStore} from './utils/setup';

const baseTransformRequest = config.transformRequest;
const baseTransformResponse = config.transformResponse;

describe('Issues', () => {
  beforeEach(() => {
    config.fetchReference = fetch;
    // tslint:disable-next-line:no-http-string
    config.baseUrl = 'http://example.com/';
    config.transformRequest = baseTransformRequest;
    config.transformResponse = baseTransformResponse;
    clearAllCache();
  });

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

  describe('should handle server response with null reference (#47)', () => {
    it('should remove the reference if null', async () => {
      class ImageRecord extends jsonapi(Model) {
        public static type = 'image';
        @prop public name!: string;
        @prop public event!: Array<EventRecord>;
      }

      class EventRecord extends jsonapi(Model) {
        public static type = 'event';
        @prop.toOneOrMany(ImageRecord)
        public image!: ImageRecord|Array<ImageRecord>;
      }

      class ApiStore extends jsonapi(Collection) {
        public static types = [ImageRecord, EventRecord];

        @computed get image() {
          return this.findAll(ImageRecord);
        }
      }

      const store = new ApiStore();

      mockApi({
        name: 'issue-47a',
        url: 'event/1',
      });

      const response = await store.fetch('event', 1);
      const event = response.data as EventRecord;
      expect(event.image).toBe(store.image[0]);

      mockApi({
        name: 'issue-47b',
        url: 'event/1',
      });
      await store.fetch('event', 1, {skipCache: true});
      expect(event.image).toBe(null);

      mockApi({
        name: 'issue-47a',
        url: 'event/1',
      });
      await store.fetch('event', 1, {skipCache: true});
      expect(event.image).toBe(store.image[0]);

      mockApi({
        name: 'issue-47d',
        url: 'event/1',
      });
      await store.fetch('event', 1, {skipCache: true});
      expect(event.image['length']).toBe(1);
      expect(event.image[0]).toBe(store.image[1]);

      mockApi({
        name: 'issue-47e',
        url: 'event/1',
      });
      await store.fetch('event', 1, {skipCache: true});
      expect(event.image['length']).toBe(0);
    });

    it('should update the reference if not null', async () => {
      class ImageRecord extends jsonapi(Model) {
        public static type = 'image';
        @prop public name!: string;
        @prop public event!: Array<EventRecord>;
      }

      class EventRecord extends jsonapi(Model) {
        public static type = 'event';
        @prop.toOneOrMany(ImageRecord)
        public image!: ImageRecord|Array<ImageRecord>;
      }

      class ApiStore extends jsonapi(Collection) {
        public static types = [ImageRecord, EventRecord];

        @computed get image() {
          return this.findAll(ImageRecord);
        }
      }

      const store = new ApiStore();

      mockApi({
        name: 'issue-47a',
        url: 'event/1',
      });
      const response = await store.fetch('event', 1);
      const event = response.data as EventRecord;
      expect(event.image).toBe(store.image[0]);

      mockApi({
        name: 'issue-47c',
        url: 'event/1',
      });
      await store.fetch('event', 1, {skipCache: true});
      expect(event.image).toBe(store.image[1]);

      mockApi({
        name: 'issue-47a',
        url: 'event/1',
      });
      await store.fetch('event', 1, {skipCache: true});
      expect(event.image).toBe(store.image[0]);
    });
  });
});
