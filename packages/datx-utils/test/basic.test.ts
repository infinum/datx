import testMobx from './mobx';

import { assignComputed, mapItems, setMeta, getMeta, isArrayLike, mobx, replaceInArray, removeFromArray } from '../src';

// @ts-ignore
testMobx.configure({ enforceActions: 'observed' });

describe('@datx/utils', () => {
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
      const expectedCount = mobx.useRealMobX ? 2 : 1;
      const obj1 = {};
      const obj2 = {};

      const data = testMobx.observable.object({
        data: 1,
      });

      assignComputed(obj1, 'foo', () => 1);
      expect(Object.prototype.propertyIsEnumerable.call(obj1, 'foo')).toBe(true);
      // @ts-ignore
      expect(testMobx.isComputedProp(obj1, 'foo')).toBe(false);

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

      testMobx.autorun(() => {
        autorunCounter1++;
        // @ts-ignore
        expect(obj1.baz).toBe(expectedData);
      });

      testMobx.autorun(() => {
        autorunCounter2++;
        // @ts-ignore
        expect(obj2.bar.baz).toBe(expectedData);
      });

      testMobx.autorun(() => {
        autorunCounter3++;
        // @ts-ignore
        expect(data.data).toBe(expectedData);
      });

      testMobx.runInAction(() => {
        expectedData = 42;
        data.data = 42;
      });

      expect(autorunCounter3).toBe(expectedCount);
      expect(autorunCounter1).toBe(expectedCount);
      expect(autorunCounter2).toBe(expectedCount);
    });

    it('should handle dynamic computed props', () => {
      let counter = 0;
      const expectedCount1 = mobx.useRealMobX ? 2 : 106;
      const expectedCount2 = mobx.useRealMobX ? 2 : 1;

      class Data {
        @testMobx.observable
        public data = 1;

        public foo!: number;

        public bar!: number;

        constructor() {
          mobx.makeObservable(this);
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

      testMobx.autorun(() => {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const tmp = data.foo;
      });

      expect(data.foo).toBe(1);
      expect(data.bar).toBe(-1);

      testMobx.runInAction(() => {
        data.bar--;
      });
      expect(data.foo).toBe(2);
      expect(data.bar).toBe(-2);

      for (let i = 0; i < 100; i++) {
        expect(data.foo).toBe(2);
      }

      expect(counter).toBe(expectedCount1);

      let autorunCounter = 0;
      let expectedData = 2;

      testMobx.autorun(() => {
        autorunCounter++;
        expect(data.foo).toBe(expectedData);
      });

      testMobx.runInAction(() => {
        expectedData = 3;
        data.foo++;
      });

      expect(autorunCounter).toBe(expectedCount2);
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
      expect(isArrayLike(testMobx.observable.array([]))).toBe(true);
      expect(isArrayLike(testMobx.observable.array([1, true, 'three', {}]))).toBe(true);
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

  describe('replaceInArray', () => {
    it('should replace the values', () => {
      const test = [{}, {}, {}];
      const newTest = [{}, {}, {}];
  
      replaceInArray(test, newTest);
  
      expect(test[0]).toBe(newTest[0]);
      expect(test.length).toBe(newTest.length);
    });
  });

  describe('removeFromArray', () => {
    it('should remove the specific value', () => {
      const test = [{}, {}, {}];
      const toRemove = test[1];

      removeFromArray(test, toRemove);
  
      expect(test).not.toContain(toRemove);
      expect(test.length).toBe(2);
    });
  });
});
