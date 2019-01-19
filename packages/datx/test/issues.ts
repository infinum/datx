// tslint:disable:max-classes-per-file

import { configure } from 'mobx';

configure({ enforceActions: 'observed' });

import {
  Collection,
  prop,
  PureModel,
} from '../src';

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
    const foo = store.add({ bar: [{ }, { }] }, Foo);
    expect(foo.bar).toHaveLength(2);

    const toRemove = foo.bar[0];

    store.remove(toRemove);
    expect(foo.bar).toHaveLength(1);
  });
});
