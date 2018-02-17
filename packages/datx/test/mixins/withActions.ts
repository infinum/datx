// tslint:disable:max-classes-per-file

import {META_FIELD} from 'datx-utils';
import {autorun} from 'mobx';

import {Collection, prop, PureModel, ReferenceType, withActions, withMeta} from '../../src';
import {storage} from '../../src/services/storage';

describe('Collection', () => {
  beforeEach(() => {
    // @ts-ignore
    storage.clear();
  });

  it('should work with initial data', () => {
    class Foo extends PureModel {
      public static type = 'foo';
      @prop public foo!: number;
      @prop public bar!: number;
      @prop public baz!: number;
    }

    const FooMeta = withMeta(Foo);
    const FooActions = withActions(FooMeta);

    const foo = new FooActions({foo: 1, bar: 2});
    expect(foo.meta.type).toBe('foo');
    expect(foo.foo).toBe(1);

    class TestCollection extends Collection {
      public static types = [Foo];
    }
    const collection = new TestCollection();
    collection.add(foo);

    const foo2 = foo.clone();

    expect(foo2).not.toBe(foo);
    expect(foo2.meta.original).toBe(foo);
    expect(foo2.foo).toBe(1);

    foo2.update({foo: 3, baz: 4});
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

    // @ts-ignore - TS won't allow this mistake
    expect(() => withActions(Collection)).toThrowError('This mixin can only decorate models');
  });

  it('should fail for other classes', () => {
    class A {}

    // @ts-ignore - TS won't allow this mistake
    expect(() => withActions(A)).toThrowError('This mixin can only decorate models');
  });
});
