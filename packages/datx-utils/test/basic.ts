import {autorun, configure, isComputedProp, isObservableProp, observable} from 'mobx';

import {assignComputed, flatten, isFalsyArray, mapItems, uniq} from '../src';

configure({enforceActions: true});

describe('datx-utils', () => {
  describe('mapUtils', () => {
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

  describe('flatten', () => {
    it('should work with a simple array', () => {
      expect(flatten([[1], [2], [3]])).toEqual([1, 2, 3]);
    });

    it('should work with a complex array', () => {
      expect(flatten([[1], [2, 3], [4, 5], [6]])).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  describe('uniq', () => {
    it('should work if no duplicates', () => {
      expect(uniq([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should remove duplicate values', () => {
      expect(uniq([1, 2, 3, 1])).toEqual([1, 2, 3]);
    });

    it('should remove multiple duplicate values', () => {
      expect(uniq([1, 2, 3, 1, 1, 2, 1, 1, 2, 3, 3, 2, 1])).toEqual([1, 2, 3]);
    });
  });

  describe('isFalsyArray', () => {
    it('should work for falsy arrays', () => {
      expect(isFalsyArray([0, null, undefined, ''])).toBe(true);
    });

    it('should work for truthy arrays', () => {
      expect(isFalsyArray([1, 2, 3, {}, [], '123'])).toBe(false);
    });

    it('should work for mixed arrays', () => {
      expect(isFalsyArray([0, null, 1, ''])).toBe(true);
    });
  });

  describe('assignComputed', () => {
    it('should set a computed prop', () => {
      const obj1 = observable({});
      const obj2 = observable.object({});

      const data = observable({
        data: 1,
      });

      assignComputed(obj1, 'foo', () => 1);
      assignComputed(obj2, 'foo', () => 2);
      // tslint:disable-next-line:no-empty
      assignComputed(obj1, 'bar', () => obj2, () => {});
      // tslint:disable-next-line:no-empty
      assignComputed(obj2, 'bar', () => obj1, () => {});
      assignComputed(obj1, 'baz', () => data.data, (a) => {
        data.data = a;
      });

      // expect(isComputedProp(obj1, 'foo')).toBe(true);
      // expect(isComputedProp(obj1, 'bar')).toBe(true);
      // expect(isComputedProp(obj1, 'baz')).toBe(true);
      // expect(isComputedProp(obj2, 'foo')).toBe(true);
      // expect(isComputedProp(obj2, 'bar')).toBe(true);

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
    });

    it('should handle dynamic computed props', () => {
      let counter = 0;
      class Data {
        @observable public data = 1;
        public foo!: number;
        public bar!: number;

        constructor() {
          assignComputed(
            this,
            'foo',
            () => {
              counter++;

              return this.data;
            },
            (val) => this.data = val,
          );
          assignComputed(
            this,
            'bar',
            () => -this.foo,
            (val) => this.foo = -val,
          );
        }
      }
      const data = new Data();

      autorun(() => {
        const tmp = data.foo;
      });

      expect(isObservableProp(data, 'data')).toBe(true);
      expect(isComputedProp(data, 'foo')).toBe(true);
      expect(isComputedProp(data, 'bar')).toBe(true);

      expect(data.foo).toBe(1);
      expect(data.bar).toBe(-1);

      data.bar--;
      expect(data.foo).toBe(2);
      expect(data.bar).toBe(-2);

      for (let i = 0; i < 100; i++) {
        expect(data.foo).toBe(2);
      }

      expect(counter).toBe(2);
    });
  });
});
