import { configure } from 'mobx';

import { Collection, PureModel, Attribute } from '../src';

configure({ enforceActions: 'observed' });

describe('issues', () => {
  it('should remove references on collection remove', () => {
    class Bar extends PureModel {
      public static type = 'bar';
    }

    class Foo extends PureModel {
      public static type = 'foo';

      @Attribute({ toMany: Bar })
      public bar!: Array<Bar>;
    }

    class Store extends Collection {
      public static types = [Foo, Bar];
    }

    const store = new Store();
    const foo = store.add({ bar: [{}, {}] }, Foo);

    expect(foo.bar).toHaveLength(2);
    expect(store.length).toBe(3);

    const toRemove = foo.bar[0];

    store.removeOne(toRemove);
    expect(store.length).toBe(2);
    expect(foo.bar).toHaveLength(1);
  });
});
