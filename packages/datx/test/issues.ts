// tslint:disable:max-classes-per-file

import { configure } from 'mobx';

configure({ enforceActions: 'observed' });

import snapshot1 from './fixtures/issues/snapshot-1.json';
import snapshot2 from './fixtures/issues/snapshot-2.json';

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

  it('should work for various updates', () => {
    class Foo extends Model {
      public static type = 'foo';

      @prop
      public type!: string;

      @prop
      public baz!: string;
    }

    const foo = new Foo();

    foo.update({ type: '123' });
    foo.update({ baz: '321' });
    foo.update({});

    expect(foo.type).toBe('123');
    expect(foo.baz).toBe('321');
  });

  it('should add references form the snapshot (insert)', () => {
    class LineItem extends PureModel {
      public static type = 'line_items';
    }

    class Cart extends PureModel {
      public static type = 'carts';

      @prop.toMany(LineItem)
      public lineItems!: Array<LineItem>;
    }

    class Store extends Collection {
      public static types = [LineItem, Cart];
    }

    const store = new Store(snapshot1);
    expect(store.findAll(LineItem).length).toBe(0);

    store.insert(snapshot2);

    expect(store.findAll(Cart).length).toBe(1);
    expect(store.findAll(LineItem).length).toBe(2);
    expect(store.findAll(Cart)[0].lineItems.length).toBe(2);
    expect(store.findAll(Cart)[0].lineItems[0]).not.toBe(null);
  });

  it('should add references form the snapshot (add)', () => {
    class LineItem extends PureModel {
      public static type = 'line_items';
    }

    class Cart extends PureModel {
      public static type = 'carts';

      @prop.toMany(LineItem)
      public lineItems!: Array<LineItem>;
    }

    class Store extends Collection {
      public static types = [LineItem, Cart];
    }

    const store = new Store(snapshot1);
    expect(store.findAll(LineItem).length).toBe(0);

    snapshot2.forEach((rawModel) => {
      store.add(rawModel, rawModel.__META__.type);
    });

    expect(store.findAll(Cart).length).toBe(1);
    expect(store.findAll(LineItem).length).toBe(2);
    expect(store.findAll(Cart)[0].lineItems.length).toBe(2);
    expect(store.findAll(Cart)[0].lineItems[0]).not.toBe(null);
  });
});
