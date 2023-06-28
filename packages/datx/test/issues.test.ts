import {
  Collection,
  PureModel,
  Attribute,
  modelToJSON,
  updateModel,
  assignModel,
  upsertModel,
  Model,
} from '../src';
import { META_FIELD } from '@datx/utils';

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

  it('should keep the same model reference after adding it to the collection', () => {
    class Foo extends PureModel {
      public static type = 'bar';
    }

    class Store extends Collection {
      public static types = [Foo];
    }

    const store = new Store();

    const foo = new Foo();
    const foo2 = store.add(foo);
    expect(foo).toBe(foo2);
  });

  it('should work when adding initialized models to collection', () => {
    class Person extends PureModel {
      public static type = 'person';

      @Attribute({ toOne: 'dog' })
      public dog!: Dog;
    }

    class Dog extends PureModel {
      public static type = 'dog';

      @Attribute()
      public name!: string;
    }

    class Store extends Collection {
      public static types = [Person, Dog];
    }

    const store = new Store();

    const person = new Person({});
    const dog = new Dog({ name: 'Floki' });

    store.add(person);
    store.add(dog);

    person.dog = dog;

    expect(person.dog?.name).toBe('Floki');
  });

  it('should work when adding un-initialized models to collection', () => {
    class Person extends PureModel {
      public static type = 'person';

      @Attribute({ toOne: 'dog' })
      public dog!: Dog;
    }

    class Dog extends PureModel {
      public static type = 'dog';

      @Attribute()
      public name!: string;

      @Attribute({ toOne: 'person' })
      public person!: Dog;
    }

    class Store extends Collection {
      public static types = [Person, Dog];
    }

    const store = new Store();

    const person = store.add({}, Person);
    const dog = store.add({ name: 'Floki' }, Dog);

    person.dog = dog;

    expect(person.dog?.name).toBe('Floki');
  });

  it('should work when setting initialized models to collection', () => {
    class Person extends PureModel {
      public static type = 'person';

      @Attribute({ toOne: 'dog' })
      public dog!: Dog;
    }

    class Dog extends PureModel {
      public static type = 'dog';

      @Attribute()
      public name!: string;
    }

    class Store extends Collection {
      public static types = [Person, Dog];
    }

    const store = new Store();

    const person1 = new Person({});
    const person2 = new Person({});
    const dog = new Dog({ name: 'Floki' });

    store.add(person1);
    store.add(person2);
    store.add(dog);

    updateModel(person1, { dog });
    assignModel(person2, 'dog', dog);

    expect(person1.dog?.name).toBe('Floki');
    expect(person1.dog).toBe(dog);

    expect(person2.dog?.name).toBe('Floki');
    expect(person2.dog).toBe(dog);
  });

  it('should work when setting un-initialized models to collection', () => {
    class Person extends PureModel {
      public static type = 'person';

      @Attribute({ toOne: 'dog' })
      public dog!: Dog;
    }

    class Dog extends PureModel {
      public static type = 'dog';

      @Attribute()
      public name!: string;

      @Attribute({ toOne: 'person' })
      public person!: Dog;
    }

    class Store extends Collection {
      public static types = [Person, Dog];
    }

    const store = new Store();

    const person = store.add({}, Person);

    updateModel(person, { dog: { name: 'Floki' } });

    expect(person.dog?.name).toBe('Floki');
    expect(person.dog).toBeInstanceOf(Dog);
  });

  it('should work with upserting partial models', () => {
    class Person extends Model {
      public static type = 'person';

      @Attribute()
      public name!: string;

      @Attribute()
      public age!: number;
    }

    class Store extends Collection {
      public static types = [Person];
    }

    const store = new Store();

    const person = store.add({ name: 'Foo', age: 1 }, Person);
    // eslint-disable-next-line no-underscore-dangle
    const personMeta = person.meta.snapshot.__META__;

    expect(person.name).toBe('Foo');

    const person2 = upsertModel(
      { age: 2, __META__: { id: personMeta?.id, type: personMeta?.type } },
      'person',
      store,
    ) as Person;

    expect(person2.age).toBe(2);
    expect(person2.name).toBe('Foo');
    expect(person2).toBe(person);
  });

  it('should work for mapped relationships', () => {
    //
  });

  it('should not add original properties if mapped', () => {
    class Foo extends Model {
      public static type = 'foo';

      @Attribute({
        map: 'some_value',
      })
      public value!: number;
    }

    class Store extends Collection {
      public static types = [Foo];
    }

    const store = new Store();

    const foo1 = store.add({ some_value: 1 }, Foo);

    const foo2 = new Foo({ value: 1 });

    expect(foo1.value).toBe(1);
    expect(foo2.value).toBe(1);

    expect(foo1.meta.snapshot?.some_value).not.toBeUndefined();
    expect(foo1.meta.snapshot?.value).toBeUndefined();
    expect(foo1.meta.snapshot[META_FIELD]?.fields?.some_value).toBeUndefined();
    expect(foo1.meta.snapshot[META_FIELD]?.fields?.value).not.toBeUndefined();

    expect(foo2.meta.snapshot?.some_value).not.toBeUndefined();
    expect(foo2.meta.snapshot?.value).toBeUndefined();
    expect(foo2.meta.snapshot[META_FIELD]?.fields?.some_value).toBeUndefined();
    expect(foo2.meta.snapshot[META_FIELD]?.fields?.value).not.toBeUndefined();
  });
});
