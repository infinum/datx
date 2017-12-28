// tslint:disable:max-classes-per-file

import {autorun} from 'mobx';

import {
  Collection,
  getModelCollections,
  getModelId,
  Model,
  prop,
  withMeta,
} from '../../src';
import {storage} from '../../src/services/storage';

describe('Collection', () => {
  beforeEach(() => {
    // @ts-ignore
    storage.clear();
  });

  it('should work with initial data', () => {
    class Foo extends Model {
      public static type = 'foo';
      @prop public foo: number;
      @prop public bar: number;
      @prop public baz: number;
    }

    const FooMeta = withMeta(Foo);

    const foo = new FooMeta({foo: 1, bar: 2});

    expect(foo.foo).toBe(1);
    expect(foo.bar).toBe(2);
    expect(foo.baz).toBe(undefined);
    expect(foo.meta.type).toBe('foo');
    expect(foo.meta.collections).toHaveLength(0);

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
});
