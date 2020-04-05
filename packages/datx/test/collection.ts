/* eslint-disable max-classes-per-file */

import { autorun, configure } from 'mobx';

import { Collection, PureModel, Attribute, updateModelId, Model } from '../src';
import { isCollection, isModel } from '../src/helpers/mixin';
import { getModelCollection, getModelId } from '../src/helpers/model/utils';

configure({ enforceActions: 'observed' });

describe('Collection', () => {
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

        @Attribute()
        public foo!: number;

        @Attribute()
        public bar!: number;

        @Attribute()
        public baz!: number;
      }

      class Baz extends PureModel {
        public static type = 'baz';
      }

      class FooBar {}

      class Store extends Collection {
        public static types = [Foo];

        public static defaultModel = undefined;
      }

      const store = new Store();
      const store2 = new Store();
      const foo1 = store.add({ foo: 1 }, Foo);
      const foo2 = store.add<Foo>({ foo: 2 }, 'foo');
      const foo3 = store.add(new Foo({ foo: 3 }));
      const foo4 = new Foo({ foo: 4 });

      expect(store.length).toBe(3);
      expect(foo1.foo).toBe(1);
      expect(foo2.foo).toBe(2);
      expect(foo3.foo).toBe(3);

      store.add(foo1);
      expect(store.length).toBe(3);

      expect(() => store2.add(foo1)).toThrowError('A model can be in a single collection at once');

      // @ts-ignore - TS won't allow this mistake
      expect(() => store.add({ foo: 4 })).toThrowError(
        'The type needs to be defined if the object is not an instance of the model.',
      );

      expect(() => store.add({ foo: 4 }, 'bar')).toThrowError(
        'No model is defined for the type bar.',
      );

      expect(() => store.add({ foo: 4 }, Baz)).toThrowError(
        'No model is defined for the type baz.',
      );

      // @ts-ignore - TS won't allow this mistake
      expect(() => store.add({ foo: 4 }, FooBar)).toThrowError(
        'The type needs to be defined if the object is not an instance of the model.',
      );

      // @ts-ignore - TS won't allow this mistake
      expect(() => store.add([{ foo: 4 }, { foo: 5 }])).toThrowError(
        'The type needs to be defined if the object is not an instance of the model.',
      );

      expect(store.hasItem(foo1)).toBe(true);
      expect(store.hasItem(foo4)).toBe(false);

      expect(getModelCollection(foo1)).toBe(store);
      store.removeOne(foo1);
      expect(getModelCollection(foo1)).toBe(undefined);
      expect(store.findOne(Foo, 'unexisting')).toBeNull();
      // @ts-ignore
      expect(store.findOne('unexisting', 1)).toBeNull();

      expect(getModelCollection(foo2)).toBe(store);
      store.removeOne(Foo, getModelId(foo2));
      expect(getModelCollection(foo2)).toBe(undefined);
      store.removeOne(Foo, 'unexisting'); // Should not do anything

      expect(store.filter((item: Foo) => item.foo > 2).length).toBe(1);
      expect(store.length).toBe(store.findAll().length);
      expect(store.findAll('unexisting').length).toBe(0);

      store.removeOne([foo3, foo4]); // Remove foo3, ignore foo4
      expect(store.length).toBe(0);
    });

    it('should work with property parsers/serializers', () => {
      class Foo extends Model {
        @Attribute({
          parse: (value: string) => parseInt(value, 10),
          serialize: (value: number) => `TEST:${value}`,
        })
        public value!: number;

        @Attribute({
          parse: (_value: string, data: Record<string, string>) => parseInt(data.value, 10) * 2,
          serialize: (value: number, data: Record<string, number>) => `TEST:${value}:${data.value}`,
        })
        public double!: number;

        @Attribute({ isIdentifier: true })
        public id!: number;
      }

      class Store extends Collection {
        public static types = [Foo];
      }

      const store = new Store();

      const foo = store.add({ value: '123', id: 1 }, Foo);

      expect(foo.value).toBe(123);
      expect(foo.double).toBe(246);

      foo.value = 321;
      expect(foo.value).toBe(321);
      expect(foo.double).toBe(246);

      const snapshot = foo.toJSON();

      expect(snapshot.value).toBe('TEST:321');
      expect(snapshot.double).toBe('TEST:246:321');

      // Make sure it doesn't trigger for other models
      store.add({ value: '234', id: 2 }, Foo);
      expect(foo.value).toBe(321);
      expect(foo.double).toBe(246);

      // Make sure it works with upsert
      store.add({ value: '345', id: 1 }, Foo);
      expect(foo.value).toBe(345);
      expect(foo.double).toBe(690);
    });

    it('should work with preprocess', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        static preprocess(data: object): object {
          return {
            ...data,
            baz: 100,
          };
        }

        @Attribute()
        public foo!: number;

        @Attribute()
        public bar!: number;

        @Attribute()
        public baz!: number;
      }

      class Store extends Collection {
        public static types = [Foo];
      }

      const store = new Store();

      const model = store.add({ foo: 1, bar: 2 }, Foo);

      expect(model.baz).toBe(100);
    });

    it('should work with removing all models of a certain type', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute()
        public foo!: number;

        @Attribute()
        public bar!: number;

        @Attribute()
        public baz!: number;
      }

      class Baz extends PureModel {
        public static type = 'baz';
      }

      class Store extends Collection {
        public static types = [Foo, Baz];
      }

      const store = new Store();

      store.add([{}, {}, {}], Foo);
      store.add([{}, {}], Baz);
      store.add({}, Foo);
      store.removeAll(Foo);
      expect(store.length).toBe(2);
    });

    it('should reset the collection', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute()
        public foo!: number;
      }

      class Store extends Collection {
        public static types = [Foo];
      }

      const store = new Store();
      const foo1 = store.add({ foo: 1 }, Foo);
      const foo2 = store.add<Foo>({ foo: 2 }, 'foo');

      expect(store.findOne('foo', getModelId(foo2))).toBeTruthy();
      expect(getModelCollection(foo1)).toBe(store);

      store.reset();

      expect(store.findOne('foo', getModelId(foo2))).toBeFalsy();
      expect(getModelCollection(foo1)).toBe(undefined);

      store.add(foo1);
      expect(getModelCollection(foo1)).toBe(store);
    });

    it('Should support serialization/deserialization', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute()
        public foo!: number;

        @Attribute()
        public bar!: number;

        @Attribute()
        public baz!: number;
      }

      class Store extends Collection {
        public static types = [Foo];
      }

      const store = new Store();
      const foo1 = store.add({ foo: 1 }, Foo);

      store.add<Foo>({ foo: 2 }, 'foo');
      store.add(new Foo({ foo: 3 }));

      const raw = store.toJSON();

      const store2 = new Store(raw);

      expect(store2.length).toBe(3);
      const foo1b = store2.find((item: Foo) => item.foo === 1);

      expect(foo1b).toBeInstanceOf(Foo);
      expect(foo1b && getModelId(foo1b)).toBe(getModelId(foo1));
      expect(foo1b).not.toBe(foo1);

      const fooB = store2.findAll(Foo)[0];

      expect(fooB).toBeInstanceOf(Foo);
    });

    it('should upsert existing models', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute()
        public foo!: number;

        @Attribute()
        public bar!: number;

        @Attribute()
        public baz!: number;
      }

      class Store extends Collection {
        public static types = [Foo];
      }

      const store = new Store();
      const foo = store.add({ foo: 1 }, Foo);

      expect(store.length).toBe(1);
      expect(store.findAll(Foo)).toHaveLength(1);

      store.add(foo);

      expect(store.length).toBe(1);
      expect(store.findAll(Foo)).toHaveLength(1);

      updateModelId(foo, '123');

      store.add(foo);

      expect(store.length).toBe(1);
      expect(store.findAll(Foo)).toHaveLength(1);
    });

    it('should make model snapshots immutable', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute()
        public foo!: number;

        @Attribute()
        public bar!: number;

        @Attribute()
        public baz!: number;
      }

      class Store extends Collection {
        public static types = [Foo];
      }

      const store = new Store();
      const foo1 = store.add({ foo: 1 }, Foo);

      store.add<Foo>({ foo: 2 }, 'foo');
      store.add(new Foo({ foo: 3 }));
      expect(foo1.foo).toBe(1);

      const raw = store.toJSON();

      raw.models[0].foo = 4;
      expect(foo1.foo).toBe(1);

      const store2 = new Store(raw);

      expect(store2.length).toBe(3);
      const foo1b = store2.find((item: Foo) => item.foo === 1);
      const foo1c = store2.find((item: Foo) => item.foo === 4);

      expect(foo1b).toBeNull();
      expect(foo1c).not.toBe(foo1);
      expect(foo1.foo).toBe(1);
    });

    it('should trigger autorun after a model is added', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute({ isIdentifier: true })
        public id!: number;

        @Attribute()
        public foo!: number;

        @Attribute()
        public bar!: number;

        @Attribute()
        public baz!: number;
      }

      class Store extends Collection {
        public static types = [Foo];
      }

      const store = new Store();

      let autorunLengthCount = 0;
      let fooLength;

      autorun(() => {
        autorunLengthCount++;
        fooLength = store.findAll(Foo).length;
      });

      let autorunModelCount = 0;
      let foo;

      autorun(() => {
        autorunModelCount++;
        foo = store.findOne(Foo, 123);
      });

      const foo2 = store.add({ id: 123 }, Foo);

      expect(autorunModelCount).toBe(2);
      expect(foo).toBe(foo2);

      expect(autorunLengthCount).toBe(2);
      expect(fooLength).toBe(1);
    });
  });
});
