import { META_FIELD } from '@datx/utils';

import { Collection, PureModel, ReferenceType, Attribute, isAttributeDirty } from '../../src';
import { withMeta } from '../../src/mixins/withMeta';
import { withActions } from '../../src/mixins/withActions';

describe('withActions', () => {
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
    const FooActions = withActions(FooMeta);

    const foo = new FooActions({ foo: 1, bar: 2 });

    expect(foo.meta.type).toBe('foo');
    expect(foo.foo).toBe(1);

    class TestCollection extends Collection {
      public static types = [FooActions];
    }
    const collection = new TestCollection();

    collection.add(foo);

    const foo2 = foo.clone();

    expect(foo2).not.toBe(foo);
    expect(foo2).toBeInstanceOf(Foo);
    expect(foo2.meta.original).toBe(foo);
    expect(foo2.foo).toBe(1);

    foo2.update({ foo: 3, baz: 4 });
    expect(foo2.foo).toBe(3);
    expect(foo.foo).toBe(1);
    expect(foo2.baz).toBe(4);

    foo2.assign('foobar', 5);
    // @ts-ignore - A new value not defined in typings
    expect(foo2.foobar).toBe(5);

    const rawFoo2 = foo2.toJSON();

    expect(rawFoo2).toHaveProperty(META_FIELD);

    foo2.addReference<Foo, typeof Foo>('parent', foo.meta.id, {
      model: FooActions as typeof Foo,
      type: ReferenceType.TO_ONE,
    });
  });

  it('should fail for collections', () => {
    // @ts-expect-error
    expect(() => withActions(Collection)).toThrowError('This mixin can only decorate models');
  });

  it('should fail for other classes', () => {
    class A {}

    // @ts-expect-error
    expect(() => withActions(A)).toThrowError('This mixin can only decorate models');
  });

  it('should work with actions', () => {
    class Foo extends PureModel {
      @Attribute()
      public foo?: number;

      @Attribute()
      public bar?: number;
    }
    const FooMeta = withActions(Foo);

    const foo = new FooMeta({ foo: 1 });
    expect(isAttributeDirty(foo, 'foo')).toBe(false);
    expect(isAttributeDirty(foo, 'bar')).toBe(false);

    foo.foo = 5;
    foo.commit();

    foo.foo = 2;
    foo.bar = 3;
    expect(isAttributeDirty(foo, 'foo')).toBe(true);
    expect(isAttributeDirty(foo, 'bar')).toBe(true);

    foo.revert();
    expect(isAttributeDirty(foo, 'foo')).toBe(false);
    expect(foo.foo).toBe(5);
    expect(isAttributeDirty(foo, 'bar')).toBe(false);
    expect(foo.bar).toBeUndefined();
  });
});
