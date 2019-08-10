// tslint:disable:max-classes-per-file

import { configure } from 'mobx';

configure({ enforceActions: 'observed' });

import { Collection, Model, prop, ToOne } from '../src';

describe('ToOne', () => {
  it('should init a bucket', () => {
    const collection = new Collection();
    const bucketInstance = new ToOne(null, collection);

    expect(bucketInstance).toBeInstanceOf(ToOne);
    expect(bucketInstance.snapshot).toBeNull();
  });

  it('should be able to get initial model', () => {
    class Foo extends Model {
      public static type = 'foo';
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{}, {}], Foo);
    const bucketInstance = new ToOne(foos[0], collection);

    expect(bucketInstance.value).toBe(foos[0]);
  });

  it('should support ids before models', () => {
    class Foo extends Model {
      public static type = 'foo';

      @prop.identifier
      public id!: number;
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const bucketInstance = new ToOne<Foo>({ id: 234, type: 'foo' }, collection);
    const foos = collection.add([{ id: 123 }, { id: 234 }], Foo);

    expect(collection.length).toBe(2);
    expect(bucketInstance.value).toBe(foos[1]);
  });

  it('should support updates', () => {
    class Foo extends Model {
      public static type = 'foo';
    }
    class Bar extends Model {
      public static type = 'bar';
    }
    class AppCollection extends Collection {
      public static types = [Foo, Bar];
    }

    const collection = new AppCollection();
    const foos = collection.add([{}, {}], Foo);
    const bucketInstance = new ToOne(foos[0], collection);

    expect(bucketInstance.value).toBe(foos[0]);
    bucketInstance.value = foos[1];
    expect(bucketInstance.value).toBe(foos[1]);
  });

  it('should throw on readonly update', () => {
    class Foo extends Model {
      public static type = 'foo';
    }
    class Bar extends Model {
      public static type = 'bar';
    }
    class AppCollection extends Collection {
      public static types = [Foo, Bar];
    }

    const collection = new AppCollection();
    const foos = collection.add([{}, {}], Foo);
    const bucketInstance = new ToOne(foos[0], collection, true);

    expect(bucketInstance.value).toBe(foos[0]);
    expect(() => {
      bucketInstance.value = foos[1];
    }).toThrowError('[datx exception] This is a read-only bucket');
  });
});
