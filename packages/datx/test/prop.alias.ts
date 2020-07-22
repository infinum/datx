// tslint:disable:max-classes-per-file
import { configure } from 'mobx';

configure({ enforceActions: 'observed' });

import { Collection, Model, prop } from '../src';

describe('prop.alias', () => {
  it('should be set value to alias property', () => {
    class Person extends Model {
      public static type = 'person';

      @prop.identifier public id!: number;
      @prop public firstName!: string;
      @prop public lastName!: string;

      @prop.toOne(Person) public spouse!: Person;
      @prop.alias('spouse') public spouseId!: number;
    }

    class Store extends Collection {
      public static types = [Person];
    }

    const store = new Store();

    const john = store.add<Person>({ firstName: 'John', lastName: 'Doe', id: 111 }, Person);
    const jane = store.add<Person>({ firstName: 'Jane', lastName: 'Doe', id: 222 }, 'person');
    expect(john.spouse).toBe(undefined);
    john.spouse = jane;
    expect(john.spouse).toBe(jane);
    expect(john.spouseId).toBe(jane.id);

    const jane2 = store.add<Person>({ firstName: 'Jane2', lastName: 'Doe2', id: 333 }, 'person');
    john.spouseId = 333;
    expect(john.spouse).toBe(jane2);

  });

  it('should be set value in multi alias property', () => {
    class Person extends Model {
      public static type = 'person';

      @prop.identifier public id!: number;
      @prop public firstName!: string;
      @prop public lastName!: string;

      @prop.toOne(Person) public spouse!: Person;
      @prop.alias('spouse') public spouseId!: number;
      @prop.alias('spouse') public spouseId2!: number;
    }

    class Store extends Collection {
      public static types = [Person];
    }

    const store = new Store();

    const john = store.add<Person>({ firstName: 'John', lastName: 'Doe', id: 111 }, Person);
    const jane = store.add<Person>({ firstName: 'Jane', lastName: 'Doe', id: 222 }, 'person');

    expect(john.spouse).toBe(undefined);
    john.spouse = jane;
    expect(john.spouseId).toBe(jane.id);
    expect(john.spouseId2).toBe(jane.id);

    const jane2 = store.add<Person>({ firstName: 'Jane2', lastName: 'Doe2', id: 333 }, 'person');
    john.spouseId2 = jane2.id;
    expect(john.spouseId).toBe(jane.id);
    expect(john.spouse.id).toBe(jane2.id);
  });

  it('should be set value at initialize on ref side', () => {
    class Person extends Model {
      public static type = 'person';

      @prop.identifier public id!: number;
      @prop public firstName!: string;
      @prop public lastName!: string;

      @prop.toOne(Person) public spouse!: Person;
      @prop.alias('spouse') public spouseId!: number;
      @prop.alias('spouse') public spouseId2!: number;
    }

    class Store extends Collection {
      public static types = [Person];
    }

    const store = new Store();

    const jane = store.add<Person>({ firstName: 'Jane', lastName: 'Doe', id: 222 }, 'person');
    const john = store.add<Person>({ firstName: 'John', lastName: 'Doe', id: 111, spouse : 222 }, Person);

    expect(john.spouseId).toBe(jane.id);
    expect(john.spouse).toBe(jane);
  });

  it('should be set value at initialize on alias side', () => {
    class Person extends Model {
      public static type = 'person';

      @prop.identifier public id!: number;
      @prop public firstName!: string;
      @prop public lastName!: string;

      @prop.toOne(Person) public spouse!: Person;
      @prop.alias('spouse') public spouseId!: number;
      @prop.alias('spouse') public spouseId2!: number;
    }

    class Store extends Collection {
      public static types = [Person];
    }

    const store = new Store();

    const jane = store.add<Person>({ firstName: 'Jane', lastName: 'Doe', id: 222 }, 'person');
    const john = store.add<Person>({ firstName: 'John', lastName: 'Doe', id: 111, spouseId : 222 }, Person);

    expect(john.spouseId).toBe(jane.id);
    expect(john.spouse).toBe(jane);
  });
});
