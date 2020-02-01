/* eslint-disable max-classes-per-file */

import { configure } from 'mobx';

import { Collection, Model, Bucket, Attribute } from '../src';

configure({ enforceActions: 'observed' });

describe('ToMany', () => {
  it('should init a bucket', () => {
    const collection = new Collection();
    const bucketInstance = new Bucket.ToMany([], collection);

    expect(bucketInstance).toBeInstanceOf(Bucket.ToMany);
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
    const bucketInstance = new Bucket.ToMany(foos, collection);

    expect(bucketInstance.length).toBe(2);
    expect(bucketInstance.value[0]).toBeInstanceOf(Foo);
    expect(bucketInstance.value[1]).toBeInstanceOf(Foo);
    expect(bucketInstance.value[0]).toBe(foos[0]);
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
    const bucketInstance = new Bucket.ToMany([...foos, ...bars], collection);

    expect(bucketInstance.length).toBe(3);
    expect(bucketInstance.value[0]).toBeInstanceOf(Foo);
    expect(bucketInstance.value[2]).toBeInstanceOf(Bar);
    expect(bucketInstance.value[0]).toBe(foos[0]);
  });

  it('should support ids before models', () => {
    class Foo extends Model {
      public static type = 'foo';

      @Attribute({ isIdentifier: true })
      public id!: number;
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const bucketInstance = new Bucket.ToMany<Foo>(
      [
        { id: '987', type: 'foo' },
        { id: '123', type: 'foo' },
        { id: '234', type: 'foo' },
      ],
      collection,
    );
    const foos = collection.add([{ id: '123' }, { id: '234' }], Foo);

    expect(collection.length).toBe(2);
    expect(bucketInstance.length).toBe(2);
    expect(bucketInstance.snapshot.length).toBe(3);
    expect(bucketInstance.value[0]).toBeInstanceOf(Foo);
    expect(bucketInstance.value[1]).toBeInstanceOf(Foo);
    expect(bucketInstance.value[0]).toBe(foos[0]);
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
    const bucketInstance = new Bucket.ToMany([...foos, ...bars], collection);

    expect(bucketInstance.length).toBe(3);
    expect(bucketInstance.value[0]).toBe(foos[0]);
    bucketInstance.value.shift();
    expect(bucketInstance.length).toBe(2);
    expect(bucketInstance.value[0]).toBe(foos[1]);

    bucketInstance.value.pop();
    expect(bucketInstance.length).toBe(1);
    expect(bucketInstance.value[0]).toBe(foos[1]);

    bucketInstance.value = foos;
    expect(bucketInstance.length).toBe(2);
    expect(bucketInstance.value[0]).toBe(foos[0]);

    bucketInstance.value.push(bars[0]);
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
    const bucketInstance = new Bucket.ToMany([...foos, ...bars], collection, true);

    expect(bucketInstance.length).toBe(3);
    expect(bucketInstance.value[0]).toBe(foos[0]);
    expect(() => {
      bucketInstance.value.shift();
    }).toThrowError('[datx exception] This is a read-only bucket');

    expect(() => {
      bucketInstance.value = foos;
    }).toThrowError('[datx exception] This is a read-only bucket');
  });
});
