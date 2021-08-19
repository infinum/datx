import testMobx from './mobx';

import {
  Collection,
  PureModel,
  Attribute,
  updateModelId,
  Model,
  getRefId,
  modelToJSON,
} from '../src';
import { isCollection, isModel } from '../src/helpers/mixin';
import { getModelCollection, getModelId } from '../src/helpers/model/utils';
import { mobx } from '@datx/utils';

// @ts-ignore
testMobx.configure({ enforceActions: 'observed' });

describe('Collection', () => {
  describe('Basic features', () => {
    it('should initialize', () => {
      const collection = new Collection();

      expect(collection.length).toBe(0);

      expect(isCollection(Collection)).toBe(true);
      expect(isModel(Collection)).toBe(false);
    });

    it('should work with models', () => {
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

      expect(() => store.add({ foo: 4 })).toThrowError(
        'The type needs to be defined if the object is not an instance of the model.',
      );

      expect(() => store.add({ foo: 4 }, 'bar')).toThrowError(
        'No model is defined for the type bar.',
      );

      expect(() => store.add({ foo: 4 }, Baz)).toThrowError(
        'No model is defined for the type baz.',
      );

      // @ts-expect-error
      expect(() => store.add({ foo: 4 }, FooBar)).toThrowError(
        'The type needs to be defined if the object is not an instance of the model.',
      );

      expect(() => store.add([{ foo: 4 }, { foo: 5 }])).toThrowError(
        'The type needs to be defined if the object is not an instance of the model.',
      );

      expect(store.hasItem(foo1)).toBe(true);
      expect(store.hasItem(foo4)).toBe(false);

      expect(getModelCollection(foo1)).toBe(store);
      store.removeOne(foo1);
      expect(getModelCollection(foo1)).toBe(undefined);
      expect(store.findOne(Foo, 'unexisting')).toBeNull();
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

        static preprocess(data: Record<string, unknown>): Record<string, unknown> {
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

      testMobx.autorun(() => {
        autorunLengthCount++;
        fooLength = store.findAll(Foo).length;
      });

      let autorunModelCount = 0;
      let foo;

      testMobx.autorun(() => {
        autorunModelCount++;
        foo = store.findOne(Foo, 123);
      });

      const foo2 = store.add({ id: 123 }, Foo);

      if (mobx.useRealMobX) {
        expect(autorunModelCount).toBe(2);
        expect(foo).toBe(foo2);

        expect(autorunLengthCount).toBe(2);
        expect(fooLength).toBe(1);
      }
      // The test doesn't make sense if MobX is not used
    });

    it('should auto set ref value at be a model is added', () => {
      class Pet extends Model {
        static type = 'pet';
        @Attribute({ isIdentifier: true }) public id!: number;
      }

      class Toy extends Model {
        static type = 'toy';
        @Attribute({ isIdentifier: true }) public id!: number;
      }

      class Person extends Model {
        static type = 'person';
        @Attribute({ isIdentifier: true }) public id!: number;
        @Attribute({ toOne: Person }) public spouse!: Person;
        @Attribute({ toMany: Pet }) public pets!: Pet[];
        @Attribute({ toOneOrMany: Toy }) public toy!: Toy | Toy[];
      }

      class Store extends Collection {
        static types = [Person, Pet, Toy];
      }

      const store = new Store();
      const steve = store.add<Person>({ spouse: 1111, id: 200, pets: [1, 2, 3] }, Person);
      const jane = store.add<Person>({ id: 1111, spouse: 200, toy: 10 }, Person);
      store.add([{ id: 1 }, { id: 2 }, { id: 3 }], Pet);

      expect(steve.spouse).toBe(jane);
      expect(jane.spouse).toBe(steve);
      expect(steve.pets).toBeInstanceOf(Array);
      expect(steve.pets.map((d) => d.id)).toEqual([1, 2, 3]);
      const toy10 = store.add({ id: 10 }, Toy);
      expect(jane.toy).toBe(toy10);
      jane.toy = store.add([{ id: 11 }, { id: 12 }], Toy);
      expect(jane.toy.map((d) => d.id)).toEqual([11, 12]);

      const store2 = new Store();
      const steve2 = store2.add<Person>({ spouse: { id: 1, type: 'person' }, id: 1 }, Person);
      expect(getRefId(steve2, 'spouse')).toEqual({ id: 1, type: 'person' });
    });

    it('should upgrade ref fields by id or id[]', () => {
      class Foo extends Model {
        static type = 'foo';
        @Attribute({ isIdentifier: true }) public id!: string;
        @Attribute({ toOne: Foo }) public parent!: Foo;
        @Attribute({ toMany: Foo }) public children!: Foo[];
      }

      class Store extends Collection {
        static types = [Foo];
      }

      const store = new Store();
      store.add(
        [
          { id: '1', parent: null, children: ['2', '3', '4'] },
          { id: '1', parent: null, children: ['2', '3', '5'] },
        ],
        Foo,
      );

      const foo1 = store.findOne<Foo>(Foo, '1');
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const refId = getRefId(foo1!, 'children');
      expect(refId).toBeInstanceOf(Array);
      expect((refId as any[]).map((d) => d.id)).toEqual(['2', '3', '5']);
    });

    it('should initialize data with id is `0`', () => {
      class Foo extends Model {
        static type = 'foo';

        @Attribute({ isIdentifier: true }) public id!: number;
        @Attribute() public name!: string;
      }

      class Store extends Collection {
        static types = [Foo];
      }

      const store = new Store();
      const foo = store.add({ id: 0, name: '99999' }, Foo);
      expect(foo.id).toBe(0);
      const fooData = modelToJSON(foo);
      expect(fooData.id).toBe(0);
      // @ts-ignore
      expect(fooData.__META__.id).toBe(0);
    });

    it('should be set nested data as ref', () => {
      class Bar extends Model {
        static type = 'bar';

        @Attribute({ isIdentifier: true }) public id!: number;
        @Attribute() public name!: string;
      }

      class Foo extends Model {
        static type = 'foo';
        @Attribute({ isIdentifier: true }) public id!: number;
        @Attribute() public name!: string;
        @Attribute({ toOne: Bar }) public bar!: Bar;
      }

      class Store extends Collection {
        static types = [Foo, Bar];
      }

      const store = new Store();
      store.add(
        {
          id: 1,
          name: 'foo0',
          bar: { id: 1, name: 'bar0' },
        },
        Foo,
      );
      store.add(
        {
          id: 1,
          name: 'foo0',
          bar: { id: 1, name: 'bar1' },
        },
        Foo,
      );

      expect(store.findAll(Foo).length).toBe(1);
      expect(store.findAll(Bar).length).toBe(1);
    });

    it('should be set raw (ref) data multi times', () => {
      class Foo extends Model {
        static type = 'foo';
        @Attribute({ isIdentifier: true }) public key!: string;
        @Attribute() public name!: string;
        @Attribute({ toMany: Foo }) public children!: Foo[];
      }

      class Store extends Collection {
        static types = [Foo];
      }

      const store = new Store();
      store.add(
        {
          key: '0',
          name: 'foo0',
        },
        Foo,
      );
      store.add(
        {
          key: '0',
          name: 'foo1',
        },
        Foo,
      );
      expect(store.findAll(Foo).length).toBe(1);
      const foo = store.findOne<Foo>(Foo, '0');
      expect(foo?.name).toBe('foo1');
      expect(foo?.children).toEqual([]);
    });
  });

  describe('Indirect references', () => {
    class Person extends Model {
      static type = 'person';

      @Attribute({ isIdentifier: true }) id!: number;

      @Attribute() public firstName!: string;
      @Attribute() public lastName!: string;

      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      @Attribute({ toMany: () => Pet, referenceProperty: 'owner' }) pets!: Array<Pet>;
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      @Attribute({ toMany: () => Toy, referenceProperty: 'owners' }) toys!: Array<Toy>;
    }

    class Pet extends Model {
      static type = 'pet';

      @Attribute() public name!: string;
      @Attribute({ toOne: () => Person }) public owner!: Person;
    }

    class Toy extends Model {
      static type = 'toy';

      @Attribute() public name!: string;
      @Attribute({ toMany: () => Person }) public owners!: Person[];
    }

    it('should be use model for indirect references', () => {
      class MyCollection extends Collection {
        static types = [Person, Pet];
      }

      const collection = new MyCollection();

      collection.add<Person>({ firstName: 'Jane', id: 1 }, Person);
      const steve = collection.add<Person>({ firstName: 'Steve', spouse: 1 }, Person);
      const fido = collection.add<Pet>({ name: 'Fido', owner: steve }, Pet);

      expect(fido.owner).toBe(steve);
      expect(steve.pets.length).toBe(1);
      expect(steve.pets[0].name).toBe(fido.name);
    });

    it('should be use id for indirect references', () => {
      class MyCollection extends Collection {
        static types = [Person, Pet];
      }

      const collection = new MyCollection();

      collection.add<Person>({ firstName: 'Jane', id: 1 }, Person);
      const steve = collection.add<Person>({ firstName: 'Steve', spouse: 1 }, Person);
      const fido = collection.add<Pet>({ name: 'Fido', owner: steve.id }, Pet);
      const wufi = collection.add<Pet>({ name: 'wufi', owner: steve.id }, Pet);

      expect(fido.owner).toBe(steve);
      expect(steve.pets.length).toBe(2);
      expect(steve.pets[0].name).toBe(fido.name);
      expect(steve.pets[1].name).toBe(wufi.name);
      collection.removeOne(wufi);
      expect(steve.pets.length).toBe(1);
      expect(steve.pets[0].name).toBe(fido.name);
    });

    it('should be use ids for indirect references', () => {
      class MyCollection extends Collection {
        static types = [Person, Pet, Toy];
      }

      const collection = new MyCollection();

      collection.add<Person>({ firstName: 'Jane', id: 1 }, Person);
      const steve = collection.add<Person>({ firstName: 'Steve', spouse: 1 }, Person);
      const jane = collection.add<Person>({ firstName: 'Jane', spouse: 1 }, Person);
      const fido = collection.add<Toy>({ name: 'Fido', owners: [steve.id, jane.id] }, Toy);

      expect(fido.owners.length).toBe(2);
      expect(fido.owners[0]).toBe(steve);
      expect(fido.owners[1]).toBe(jane);
      expect(steve.toys.length).toBe(1);
      expect(jane.toys.length).toBe(1);
      expect(steve.toys[0].name).toBe(fido.name);
      expect(jane.toys[0].name).toBe(fido.name);
    });

    it('should be use ids for indirect references before references existed', () => {
      class MyCollection extends Collection {
        static types = [Person, Pet, Toy];
      }

      const collection = new MyCollection();

      collection.add<Person>({ firstName: 'Jane', id: 1 }, Person);
      const fido = collection.add<Toy>({ name: 'Fido', owners: [1, 2] }, Toy);
      const steve = collection.add<Person>({ firstName: 'Steve', spouse: 2, id: 1 }, Person);
      const jane = collection.add<Person>({ firstName: 'Jane', spouse: 1, id: 2 }, Person);

      expect(fido.owners.length).toBe(2);
      expect(fido.owners[0]).toBe(steve);
      expect(fido.owners[1]).toBe(jane);
      expect(steve.toys.length).toBe(1);
      expect(jane.toys.length).toBe(1);
      expect(steve.toys[0].name).toBe(fido.name);
      expect(jane.toys[0].name).toBe(fido.name);
    });

    it('should be use modelRefs for indirect references', () => {
      class MyCollection extends Collection {
        static types = [Person, Pet, Toy];
      }

      const collection = new MyCollection();

      collection.add<Person>({ firstName: 'Jane', id: 1 }, Person);
      const steve = collection.add<Person>({ firstName: 'Steve', spouse: 1 }, Person);
      const jane = collection.add<Person>({ firstName: 'Jane', spouse: 1 }, Person);
      const fido = collection.add<Toy>(
        {
          name: 'Fido',
          owners: [
            { type: 'person', id: steve.id },
            { type: 'person', id: jane.id },
          ],
        },
        Toy,
      );

      expect(fido.owners.length).toBe(2);
      expect(fido.owners[0]).toBe(steve);
      expect(fido.owners[1]).toBe(jane);
      expect(steve.toys.length).toBe(1);
      expect(jane.toys.length).toBe(1);
      expect(steve.toys[0].name).toBe(fido.name);
      expect(jane.toys[0].name).toBe(fido.name);
    });
  });
});
