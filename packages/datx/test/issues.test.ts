import { Collection, PureModel, Attribute, modelToJSON } from '../src';

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

  it('should not contain the original name of a mapped prop', () => {
    class Foo extends PureModel {
      @Attribute({
        map: 'some_value',
      })
      public value!: number;
    }

    const foo = new Foo({ some_value: 1 });

    expect('some_value' in foo).toBe(false);
    expect(foo.value).toBe(1);

    foo.value = 2;

    const snapshot = modelToJSON(foo);

    expect(snapshot.some_value).toBe(2);
    expect('value' in snapshot).toBe(false);
  });

  it('should be possible to use getters instead of mapped props', () => {
    class Foo extends PureModel {
      @Attribute({
        map: 'value',
      })
      private _value!: string;

      public get value() {
        return Number(this._value) * 2;
      }

      public set value(value: number) {
        this._value = String(value / 2);
      }
    }

    const foo = new Foo({ value: '1' });

    expect(foo.value).toBe(2);

    foo.value = 6;

    const snapshot = modelToJSON(foo);

    expect(snapshot.value).toBe('3');
  });
});
