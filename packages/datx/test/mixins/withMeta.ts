import { autorun, configure, runInAction } from 'mobx';

import { Collection, PureModel, Attribute } from '../../src';
import { withMeta } from '../../src/mixins/withMeta';
import { cloneModel, getModelRef, revertModel } from '../../src/helpers/model/utils';

configure({ enforceActions: 'observed' });

describe('withMeta', () => {
  it('should work with initial data', () => {
    class Foo extends PureModel {
      public static type = 'foo';

      @Attribute()
      public foo!: number;

      @Attribute()
      public bar!: number;

      @Attribute()
      public baz!: number;
    }

    const FooMeta = withMeta(Foo);

    const foo = new FooMeta({ foo: 1, bar: 2 });

    expect(foo.foo).toBe(1);
    expect(foo.bar).toBe(2);
    expect(foo.baz).toBe(undefined);
    expect(foo.meta.type).toBe('foo');
    expect(foo.meta.original).toBe(undefined);
    expect(foo.meta.collection).toBeFalsy();

    let bazValue: number | undefined = undefined;
    let autorunCount = 0;

    autorun(() => {
      expect(foo.baz).toBe(bazValue);
      autorunCount++;
    });

    bazValue = 3;

    runInAction(() => {
      foo.baz = 3;
    });

    expect(autorunCount).toBe(2);

    class TestCollection extends Collection {
      public static types = [FooMeta];
    }
    const collection = new TestCollection();

    collection.add(foo);

    const foo2 = cloneModel(foo);

    expect(foo2).not.toBe(foo);
    expect(foo2.meta.original).toBe(foo);

    expect(() => {
      foo2.meta.type = 'bar';
    }).toThrowError();

    expect(Object.prototype.propertyIsEnumerable.call(foo2, 'meta')).toBe(false);
  });

  it('should fail for collections', () => {
    // @ts-expect-error
    expect(() => withMeta(Collection)).toThrowError('This mixin can only decorate models');
  });

  it('should fail for other classes', () => {
    class A {}

    // @ts-expect-error
    expect(() => withMeta(A)).toThrowError('This mixin can only decorate models');
  });

  it('should support meta ref ids', () => {
    class Foo extends PureModel {
      public static type = 'foo';

      @Attribute({ toOne: Foo })
      public parent?: Foo;

      @Attribute({ defaultValue: 1 })
      public foo!: number;
    }

    const FooMeta = withMeta(Foo);

    class TestCollection extends Collection {
      public static types = [FooMeta];
    }
    const collection = new TestCollection();

    const foo1 = new FooMeta({ foo: 2 });

    collection.add(foo1);

    const foo2 = collection.add({ foo: 3, parent: foo1 }, FooMeta);

    expect(foo2.meta.refs.parent).toEqual(getModelRef(foo1));
  });

  it('should work with meta', () => {
    class Foo extends withMeta(PureModel) {
      @Attribute()
      public foo?: number;

      @Attribute()
      public bar?: number;
    }

    const foo = new Foo({ foo: 1 });
    expect(foo.meta.dirty.foo).toBe(false);
    expect(foo.meta.dirty.bar).toBe(false);

    foo.foo = 2;
    foo.bar = 3;
    expect(foo.meta.dirty.foo).toBe(true);
    expect(foo.meta.dirty.bar).toBe(true);

    revertModel(foo);
    expect(foo.meta.dirty.foo).toBe(false);
    expect(foo.foo).toBe(1);
    expect(foo.meta.dirty.bar).toBe(false);
    expect(foo.bar).toBeUndefined();
  });
});
