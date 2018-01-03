// tslint:disable:max-classes-per-file

import {Collection, getModelCollections, getModelId, Model, prop} from '../src';
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
    });

    it('Should work with models', () => {
      class Foo extends Model {
        public static type = 'foo';

        @prop public foo: number;
        @prop public bar: number;
        @prop public baz: number;
      }

      class Baz extends Model {
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

      expect(getModelCollections(foo1).length).toBe(1);
      store.remove(foo1);
      expect(getModelCollections(foo1).length).toBe(0);

      expect(getModelCollections(foo2).length).toBe(1);
      store.remove(Foo, getModelId(foo2));
      expect(getModelCollections(foo2).length).toBe(0);

      expect(store.filter((item: Foo) => item.foo > 2).length).toBe(1);
      expect(store.length).toBe(store.findAll().length);
    });

    it('should destroy the collection', () => {
      class Foo extends Model {
        public static type = 'foo';
        @prop public foo: number;
      }

      class Store extends Collection {
        public static types = [Foo];
      }

      const store = new Store();
      const foo1 = store.add({foo: 1}, Foo);
      const foo2 = store.add<Foo>({foo: 2}, 'foo');

      expect(storage.findModel('foo', getModelId(foo2))).toBeTruthy();
      expect(getModelCollections(foo1)).toHaveLength(1);

      store.destroy();

      expect(storage.findModel('foo', getModelId(foo2))).toBeFalsy();
      expect(getModelCollections(foo1)).toHaveLength(0);

      expect(() => store.add(foo1)).toThrowError('Can\'t modify a destroyed collection');
    });

    it('should reset the collection', () => {
      class Foo extends Model {
        public static type = 'foo';
        @prop public foo: number;
      }

      class Store extends Collection {
        public static types = [Foo];
      }

      const store = new Store();
      const foo1 = store.add({foo: 1}, Foo);
      const foo2 = store.add<Foo>({foo: 2}, 'foo');

      expect(storage.findModel('foo', getModelId(foo2))).toBeTruthy();
      expect(getModelCollections(foo1)).toHaveLength(1);

      store.reset();

      expect(storage.findModel('foo', getModelId(foo2))).toBeFalsy();
      expect(getModelCollections(foo1)).toHaveLength(0);

      store.add(foo1);
      expect(getModelCollections(foo1)).toHaveLength(1);
    });

    it('Should support serialization/deserialization', () => {
      class Foo extends Model {
        public static type = 'foo';

        @prop public foo: number;
        @prop public bar: number;
        @prop public baz: number;
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
      expect(getModelId(foo1b)).toBe(getModelId(foo1));
      expect(foo1b).toBe(foo1);

      const fooB = store2.find(Foo);
      expect(fooB).toBeInstanceOf(Foo);
    });

    it('should upsert existing models', () => {
      class Foo extends Model {
        public static type = 'foo';

        @prop public foo: number;
        @prop public bar: number;
        @prop public baz: number;
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
      expect(foo1b).toBe(undefined);
      expect(foo1c).toBe(foo1);
      expect(foo1.foo).toBe(4);
    });
  });
});
