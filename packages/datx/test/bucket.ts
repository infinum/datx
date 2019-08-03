// tslint:disable:max-classes-per-file

import { configure } from 'mobx';

configure({ enforceActions: 'observed' });

import { Bucket, Collection, Model, prop } from '../src';

describe('Bucket', () => {
  it('should init a bucket', () => {
    const collection = new Collection();
    const bucketInstance = new Bucket([], collection);

    expect(bucketInstance).toBeInstanceOf(Bucket);
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
    const bucketInstance = new Bucket(foos, collection);

    expect(bucketInstance.length).toBe(2);
    expect(bucketInstance.list[0]).toBeInstanceOf(Foo);
    expect(bucketInstance.list[1]).toBeInstanceOf(Foo);
    expect(bucketInstance.list[0]).toBe(foos[0]);
  });

  it('should be support types', () => {
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
    const bucketInstance = new Bucket([...foos, ...bars], collection);

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
    const bucketInstance = new Bucket<Foo>(
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
});
