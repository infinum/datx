import {
  autorun,
  configure,
  runInAction,
  isComputedProp,
  observable,
  makeAutoObservable,
} from 'mobx';

import { assignComputed, mapItems, setMeta, getMeta, isArrayLike } from '../src';

configure({ enforceActions: 'observed' });

describe('datx-utils', () => {
  describe('mapItems', () => {
    it('should work for null', () => {
      expect(mapItems(null, () => 1)).toBe(null);
    });

    it('should work for a single item', () => {
      expect(mapItems(1, (i) => i * 2)).toBe(2);
    });

    it('should work for an array', () => {
      expect(mapItems([1, 2], (i) => i * 2)).toEqual([2, 4]);
    });
  });

  describe('assignComputed', () => {
    it('should set a computed prop', () => {
      const obj1 = {};
      const obj2 = {};

      const data = observable({
        data: 1,
      });

      assignComputed(obj1, 'foo', () => 1);
      expect(Object.prototype.propertyIsEnumerable.call(obj1, 'foo')).toBe(true);
      expect(isComputedProp(obj1, 'foo')).toBe(false);

      assignComputed(obj2, 'foo', () => 2);
      expect(Object.prototype.propertyIsEnumerable.call(obj2, 'foo')).toBe(true);
      assignComputed(
        obj1,
        'bar',
        () => obj2,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
      );
      assignComputed(
        obj2,
        'bar',
        () => obj1,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
      );
      assignComputed(
        obj1,
        'baz',
        () => data.data,
        (a) => {
          data.data = a;
        },
      );

      // @ts-ignore
      expect(obj1.foo).toBe(1);

      // @ts-ignore
      expect(obj2.foo).toBe(2);

      // @ts-ignore
      expect(obj1.bar).toBe(obj2);

      // @ts-ignore
      expect(obj2.bar).toBe(obj1);

      // @ts-ignore
      expect(obj1.baz).toBe(1);
      // @ts-ignore
      obj1.baz = 6;
      // @ts-ignore
      expect(obj1.baz).toBe(6);
      expect(data.data).toBe(6);

      let autorunCounter1 = 0;
      let autorunCounter2 = 0;
      let autorunCounter3 = 0;
      let expectedData = 6;

      autorun(() => {
        autorunCounter1++;
        // @ts-ignore
        expect(obj1.baz).toBe(expectedData);
      });

      autorun(() => {
        autorunCounter2++;
        // @ts-ignore
        expect(obj2.bar.baz).toBe(expectedData);
      });

      autorun(() => {
        autorunCounter3++;
        // @ts-ignore
        expect(data.data).toBe(expectedData);
      });

      runInAction(() => {
        expectedData = 42;
        data.data = 42;
      });

      expect(autorunCounter3).toBe(2);
      expect(autorunCounter1).toBe(2);
      expect(autorunCounter2).toBe(2);
    });

    it('should handle dynamic computed props', () => {
      let counter = 0;

      class Data {
        public data = 1;

        public foo!: number;

        public bar!: number;

        constructor() {
          makeAutoObservable(this);
          assignComputed(
            this,
            'foo',
            () => {
              counter++;

              return this.data;
            },
            (val) => (this.data = val),
          );
          assignComputed(
            this,
            'bar',
            () => -this.foo,
            (val) => (this.foo = -val),
          );
        }
      }
      const data = new Data();

      autorun(() => {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const tmp = data.foo;
      });

      expect(data.foo).toBe(1);
      expect(data.bar).toBe(-1);

      runInAction(() => {
        console.log('bar--');
        data.bar--;
      });
      expect(data.foo).toBe(2);
      expect(data.bar).toBe(-2);

      for (let i = 0; i < 100; i++) {
        expect(data.foo).toBe(2);
      }

      expect(counter).toBe(2);

      let autorunCounter = 0;
      let expectedData = 2;

      autorun(() => {
        autorunCounter++;
        expect(data.foo).toBe(expectedData);
      });

      runInAction(() => {
        expectedData = 3;
        data.foo++;
      });

      expect(autorunCounter).toBe(2);
      expect(Object.prototype.propertyIsEnumerable.call(data, 'foo')).toBe(true);
    });

    it('should handle computed reassignment', () => {
      const obj: any = {};

      assignComputed(obj, 'foo', () => 1);
      assignComputed(obj, 'foo', () => 2);

      expect(obj['foo']).toBe(2);
    });
  });

  describe('meta getter/setter', () => {
    it('should save the exact data, not be enumerable', () => {
      const obj = {};
      const metaData = { foo: 1 };

      setMeta(obj, 'test', metaData);
      const savedMeta = getMeta(obj, 'test');

      expect(savedMeta).toBe(metaData);
      expect(Object.keys(obj)).toEqual([]);
    });

    it('should work for chains', () => {
      const obj1 = {};
      const obj2 = Object.create(obj1);
      const obj3 = Object.create(obj2);
      const metaData = { foo: 1 };

      setMeta(obj1, 'test', metaData);

      expect(getMeta(obj3, 'test', {}, true)).toBe(metaData);
    });

    it('should work for chain merging', () => {
      const obj1 = {};
      const obj2 = Object.create(obj1);
      const obj3 = Object.create(obj2);

      setMeta(obj1, 'test', { foo: 1 });
      setMeta(obj2, 'test', { bar: 2 });
      setMeta(obj3, 'test', { baz: 3 });

      expect(getMeta(obj3, 'test', {}, true)).toEqual({ baz: 3 });
      expect(getMeta(obj3, 'test', {}, true, true)).toEqual({ foo: 1, bar: 2, baz: 3 });
    });

    it('should work with default data', () => {
      const obj = {};
      const metaData = { foo: 1 };

      expect(getMeta(obj, 'test', metaData)).toBe(metaData);
      expect(getMeta(obj, 'test')).toBe(undefined);
      expect(Object.keys(obj)).toEqual([]);
    });
  });

  describe('isArrayLike', () => {
    it('should work with regular arrays', () => {
      expect(isArrayLike([])).toBe(true);
      expect(isArrayLike([1, true, 'three', {}])).toBe(true);
    });

    it('should work with observable arrays', () => {
      expect(isArrayLike(observable([]))).toBe(true);
      expect(isArrayLike(observable([1, true, 'three', {}]))).toBe(true);
    });

    it('should fail for sets', () => {
      expect(isArrayLike(new Set([]))).toBe(false);
      expect(isArrayLike(new Set([1, true, 'three', {}]))).toBe(false);
    });

    it('should fail for other values', () => {
      expect(isArrayLike({})).toBe(false);
      expect(isArrayLike({ length: 3 })).toBe(false);
      expect(isArrayLike(true)).toBe(false);
      expect(isArrayLike('array')).toBe(false);
      expect(isArrayLike(Symbol('test'))).toBe(false);
    });
  });
});
