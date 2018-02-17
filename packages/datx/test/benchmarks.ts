// tslint:disable:max-classes-per-file

import {Collection as OldCollection, Model as OldModel} from 'mobx-collection-store';

import {Collection, prop, PureModel} from '../src';
import {storage} from '../src/services/storage';

const test1 = 1000;

describe('Benchmarks', () => {
  describe('DatX', () => {
    beforeEach(() => {
      // @ts-ignore
      storage.clear();
    });

    it(`should add ${test1} items`, () => {
      const data: Array<{index: number}> = [];

      for (let index = 0; index < test1; index++) {
        data.push({index});
      }

      class Count extends PureModel {
        public static type = 'count';
        @prop public index!: number;
      }

      class TestCollection extends Collection {
        public static types = [Count];
      }

      const store = new TestCollection();

      store.add(data, Count);

      expect(store.length).toBe(test1);
    });
  });

  describe('mobx-collection-store', () => {
    it(`should add ${test1} items`, () => {
      const data: Array<{index: number}> = [];

      for (let index = 0; index < test1; index++) {
        data.push({index});
      }

      class Count extends OldModel {
        public static type = 'count';
        public static defaults = {
          index: undefined,
        };

        public index!: number;
      }

      class TestCollection extends OldCollection {
        public static types = [Count];
      }

      const store = new TestCollection();

      store.add(data, Count);

      expect(store.length).toBe(test1);
    });
  });
});
