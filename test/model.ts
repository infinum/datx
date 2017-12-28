// tslint:disable:max-classes-per-file

import {autorun} from 'mobx';

import {
  cloneModel,
  getModelId,
  getOriginalModel,
  Model,
  prop,
} from '../src';
import {storage} from '../src/services/storage';

describe('Model', () => {
  beforeEach(() => {
    // @ts-ignore
    storage.clear();
  });

  describe('Basic deatures', () => {
    it('should work with initial data', () => {
      class Foo extends Model {
        @prop public foo: number;
        @prop public bar: number;
        @prop public baz: number;
      }

      const foo = new Foo({foo: 1, bar: 2});

      expect(foo.foo).toBe(1);
      expect(foo.bar).toBe(2);
      expect(foo.baz).toBe(undefined);

      let bazValue: number;
      let autorunCount = 0;

      autorun(() => {
        expect(foo.baz).toBe(bazValue);
        autorunCount++;
      });

      bazValue = 3;
      foo.baz = 3;

      expect(autorunCount).toBe(2);
    });

    it('should work with default data', () => {
      class Foo extends Model {
        @prop.defaultValue(4) public foo: number;
        @prop.defaultValue(5) public bar: number;
      }

      const foo = new Foo({bar: 2});

      expect(foo.foo).toBe(4);
      expect(foo.bar).toBe(2);

      let fooValue: number = 4;
      let autorunCount = 0;

      autorun(() => {
        expect(foo.foo).toBe(fooValue);
        autorunCount++;
      });

      fooValue = 3;
      foo.foo = 3;

      expect(autorunCount).toBe(2);
    });

    it('should work with two models', () => {
      class Foo extends Model {
        @prop.defaultValue(4) public foo: number;
        @prop.defaultValue(5) public bar: number;
      }

      class Bar extends Model {
        public foo: number;
        public bar: number;
      }

      const bar = new Bar({bar: 2});

      expect(bar.foo).toBe(undefined);
      expect(bar.bar).toBe(2);
    });

    it('should work with extended models', () => {
      class Foo extends Model {
        @prop.defaultValue(4) public foo: number;
        @prop.defaultValue(5) public bar: number;
      }

      class Bar extends Foo {
        @prop.defaultValue(9) public baz: number;
      }

      const bar = new Bar({bar: 2});

      expect(bar.foo).toBe(4);
      expect(bar.bar).toBe(2);
      expect(bar.baz).toBe(9);
    });

    it('should support cloning', () => {
      class Foo extends Model {
        @prop public foo: number;
      }

      const foo = new Foo({foo: 1});
      expect(foo.foo).toBe(1);

      const foo2 = cloneModel(foo);
      expect(foo2.foo).toBe(1);
      expect(foo2).toBeInstanceOf(Foo);
      expect(getModelId(foo)).not.toBe(getModelId(foo2));
      expect(getOriginalModel(foo2)).toBe(foo);
    });
  });
});
