import testMobx from './mobx';

import { Collection, PureModel, Attribute, modelToJSON } from '../src';

// @ts-ignore
testMobx.configure({ enforceActions: 'observed' });

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

  it('should work with Date property parser', () => {
    class Foo extends PureModel {
      @Attribute({
        parse: (value: string) => new Date(value),
        serialize: (value: Date) => value.toISOString(),
      })
      public value!: Date;
    }

    const foo = new Foo({ value: '2022-01-01T00:00:00.000Z' });

    expect(foo.value).toBeInstanceOf(Date);
    expect(foo.value.getFullYear()).toBe(2022);

    foo.value = new Date('2021-07-31T00:00:00.000Z');
    expect(foo.value).toBeInstanceOf(Date);

    const snapshot = modelToJSON(foo);

    expect(snapshot.value).toBe('2021-07-31T00:00:00.000Z');
  });
});
