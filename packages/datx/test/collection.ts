// tslint:disable:max-classes-per-file

import {Collection, getModelCollection, getModelId, prop, PureModel} from '../src';
import {isCollection, isModel} from '../src/helpers/mixin';
import {storage} from '../src/services/storage';

describe('Collection', () => {
  beforeEach(() => {
    // @ts-ignore
    storage.clear();
  });

  describe('Basic features', () => {
    it('should initialize', () => {
      const collection = new Collection();
      expect(collection.length).toBe(0);

      expect(isCollection(Collection)).toBe(true);
      expect(isModel(Collection)).toBe(false);
    });

    it('Should work with models', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @prop public foo!: number;
        @prop public bar!: number;
        @prop public baz!: number;
      }

      class Baz extends PureModel {
        public static type = 'baz';
      }

      class FooBar {}

      class Store extends Collection {
        public static types = [Foo];
      }

      const store = new Store();
      const foo1 = store.add({foo: 1}, Foo);
      const foo2 = store.add<Foo>({foo: 2}, 'foo');
      const foo3 = store.add(new Foo({foo: 3}));
      const foo4 = new Foo({foo: 4});

      expect(store.length).toBe(3);
      expect(foo1.foo).toBe(1);
      expect(foo2.foo).toBe(2);
      expect(foo3.foo).toBe(3);

      store.add(foo1);
      expect(store.length).toBe(3);

      // @ts-ignore - TS won't allow this mistake
      expect(() => store.add({foo: 4}))
        .toThrowError('The type needs to be defined if the object is not an instance of the model.');

      expect(() => store.add({foo: 4}, 'bar'))
        .toThrowError('No model is defined for the type bar.');

      expect(() => store.add({foo: 4}, Baz))
        .toThrowError('No model is defined for the type baz.');

      // @ts-ignore - TS won't allow this mistake
      expect(() => store.add({foo: 4}, FooBar))
        .toThrowError('The type needs to be defined if the object is not an instance of the model.');

      // @ts-ignore - TS won't allow this mistake
      expect(() => store.add([{foo: 4}, {foo: 5}]))
        .toThrowError('The type needs to be defined if the object is not an instance of the model.');

      expect(store.hasItem(foo1)).toBe(true);
      expect(store.hasItem(foo4)).toBe(false);

      expect(getModelCollection(foo1)).toBe(store);
      store.remove(foo1);
      expect(getModelCollection(foo1)).toBe(undefined);
      expect(store.find(Foo, 'unexisting')).toBeNull();
      expect(store.find('unexisting')).toBeNull();

      expect(getModelCollection(foo2)).toBe(store);
      store.remove(Foo, getModelId(foo2));
      expect(getModelCollection(foo2)).toBe(undefined);
      store.remove(Foo, 'unexisting'); // Should not do anything

      expect(store.filter((item: Foo) => item.foo > 2).length).toBe(1);
      expect(store.length).toBe(store.findAll().length);
      expect(store.findAll('unexisting').length).toBe(0);

      store.remove([foo3, foo4]); // Remove foo3, ignore foo4
      expect(store.length).toBe(0);

    });

    it('should reset the collection', () => {
      class Foo extends PureModel {
        public static type = 'foo';
        @prop public foo!: number;
      }

      class Store extends Collection {
        public static types = [Foo];
      }

      const store = new Store();
      const foo1 = store.add({foo: 1}, Foo);
      const foo2 = store.add<Foo>({foo: 2}, 'foo');

      expect(store.find('foo', getModelId(foo2))).toBeTruthy();
      expect(getModelCollection(foo1)).toBe(store);

      store.reset();

      expect(store.find('foo', getModelId(foo2))).toBeFalsy();
      expect(getModelCollection(foo1)).toBe(undefined);

      store.add(foo1);
      expect(getModelCollection(foo1)).toBe(store);
    });

    it('Should support serialization/deserialization', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @prop public foo!: number;
        @prop public bar!: number;
        @prop public baz!: number;
      }

      class Store extends Collection {
        public static types = [Foo];
      }

      const store = new Store();
      const foo1 = store.add({foo: 1}, Foo);
      const foo2 = store.add<Foo>({foo: 2}, 'foo');
      const foo3 = store.add(new Foo({foo: 3}));

      const raw = store.toJSON();

      const store2 = new Store(raw);
      expect(store2.length).toBe(3);
      const foo1b = store2.find((item: Foo) => item.foo === 1);
      expect(foo1b).toBeInstanceOf(Foo);
      expect(foo1b && getModelId(foo1b)).toBe(getModelId(foo1));
      expect(foo1b).not.toBe(foo1);

      const fooB = store2.find(Foo);
      expect(fooB).toBeInstanceOf(Foo);
    });

    it('should upsert existing models', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @prop public foo!: number;
        @prop public bar!: number;
        @prop public baz!: number;
      }

      class Store extends Collection {
        public static types = [Foo];
      }

      const store = new Store();
      const foo1 = store.add({foo: 1}, Foo);
      const foo2 = store.add<Foo>({foo: 2}, 'foo');
      const foo3 = store.add(new Foo({foo: 3}));
      expect(foo1.foo).toBe(1);

      const raw = store.toJSON();
      raw[0].foo = 4;
      expect(foo1.foo).toBe(1);

      const store2 = new Store(raw);
      expect(store2.length).toBe(3);
      const foo1b = store2.find((item: Foo) => item.foo === 1);
      const foo1c = store2.find((item: Foo) => item.foo === 4);
      expect(foo1b).toBeNull();
      expect(foo1c).not.toBe(foo1);
      expect(foo1.foo).toBe(1);
    });
  });
});
