// tslint:disable:max-classes-per-file

import { configure } from 'mobx';

configure({ enforceActions: 'observed' });

import { Collection, Model, prop, ToMany } from '../src';

describe('ToMany', () => {
  it('should init a bucket', () => {
    const collection = new Collection();
    const bucketInstance = new ToMany([], collection);

    expect(bucketInstance).toBeInstanceOf(ToMany);
  });

  it('should be able to get initial models', () => {
    class Foo extends Model {
      public static type = 'foo';
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{}, {}], Foo);
    const bucketInstance = new ToMany(foos, collection);

    expect(bucketInstance.length).toBe(2);
    expect(bucketInstance.list[0]).toBeInstanceOf(Foo);
    expect(bucketInstance.list[1]).toBeInstanceOf(Foo);
    expect(bucketInstance.list[0]).toBe(foos[0]);
  });

  it('should support multiple types', () => {
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
    const bars = collection.add([{}], Bar);
    const bucketInstance = new ToMany([...foos, ...bars], collection);

    expect(bucketInstance.length).toBe(3);
    expect(bucketInstance.list[0]).toBeInstanceOf(Foo);
    expect(bucketInstance.list[2]).toBeInstanceOf(Bar);
    expect(bucketInstance.list[0]).toBe(foos[0]);
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
    const bucketInstance = new ToMany<Foo>(
      [{ id: 987, type: 'foo' }, { id: 123, type: 'foo' }, { id: 234, type: 'foo' }],
      collection,
    );
    const foos = collection.add([{ id: 123 }, { id: 234 }], Foo);

    expect(collection.length).toBe(2);
    expect(bucketInstance.length).toBe(2);
    expect(bucketInstance.snapshot.length).toBe(3);
    expect(bucketInstance.list[0]).toBeInstanceOf(Foo);
    expect(bucketInstance.list[1]).toBeInstanceOf(Foo);
    expect(bucketInstance.list[0]).toBe(foos[0]);
  });

  it('should support array updates', () => {
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
    const bars = collection.add([{}], Bar);
    const bucketInstance = new ToMany([...foos, ...bars], collection);

    expect(bucketInstance.length).toBe(3);
    expect(bucketInstance.list[0]).toBe(foos[0]);
    bucketInstance.list.shift();
    expect(bucketInstance.length).toBe(2);
    expect(bucketInstance.list[0]).toBe(foos[1]);

    bucketInstance.list = foos;
    expect(bucketInstance.length).toBe(2);
    expect(bucketInstance.list[0]).toBe(foos[0]);

    bucketInstance.list.push(bars[0]);
    expect(bucketInstance.length).toBe(3);
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
    const bars = collection.add([{}], Bar);
    const bucketInstance = new ToMany([...foos, ...bars], collection, true);

    expect(bucketInstance.length).toBe(3);
    expect(bucketInstance.list[0]).toBe(foos[0]);
    expect(() => {
      bucketInstance.list.shift();
    }).toThrowError('[datx exception] This is a read-only bucket');

    expect(() => {
      bucketInstance.list = foos;
    }).toThrowError('[datx exception] This is a read-only bucket');
  });
});
