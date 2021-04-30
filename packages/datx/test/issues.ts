// tslint:disable:max-classes-per-file

import { configure } from 'mobx';

configure({ enforceActions: 'observed' });

import { Collection, prop, PureModel, Model } from '../src';

describe('issues', () => {
  it('should remove references on collection remove', () => {
    class Bar extends PureModel {
      public static type = 'bar';
    }

    class Foo extends PureModel {
      public static type = 'foo';

      @prop.toMany(Bar) public bar!: Array<Bar>;
    }

    class Store extends Collection {
      public static types = [Foo, Bar];
    }

    const store = new Store();
    const foo = store.add({ bar: [{}, {}] }, Foo);
    expect(foo.bar).toHaveLength(2);

    const toRemove = foo.bar[0];

    store.removeOne(toRemove);
    expect(foo.bar).toHaveLength(1);
  });

  it('should not get properties from other models', () => {
    class BaseModel extends PureModel {
      @prop
      public id!: string;
    }

    class Foo extends BaseModel {
      public static type = 'foo';

      @prop
      public fooName!: string;
    }

    // @ts-ignore
    class Bar extends BaseModel {
      public static type = 'bar';

      @prop
      public barName!: string;
    }

    const foo = new Foo();
    expect('barName' in foo).toBe(false);
  });

  it('should init the correct type', () => {
    class Foo extends Model {
      public static type = 'foo';

      @prop
      public id!: number;

      @prop
      public type!: string;
    }
    class MockStore extends Collection {
      public static types = [Foo];
    }
    const store = new MockStore();

    const foo = store.add(
      {
        id: 123,
        type: 'some-type',
        __META__: {
          id: 1,
          type: 'foo',
        },
      },
      Foo,
    );

    expect(foo).toBeInstanceOf(Foo);
    expect(foo.type).toBe('some-type');
    expect(foo.meta.type).toBe('foo');
  });
});
