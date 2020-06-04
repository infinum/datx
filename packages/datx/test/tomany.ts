import { configure } from 'mobx';

import { Collection, Model, Bucket, Attribute, PureCollection } from '../src';

configure({ enforceActions: 'observed' });

describe('ToMany', () => {
  describe('static', () => {
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

  describe('dynamic', () => {
    it('should work with a function and class type', () => {
      class Bar extends Model {
        public static type = 'bar';

        @Attribute()
        public value!: number;
      }

      class Foo extends Model {
        public static type = 'foo';

        @Attribute({
          toMany: (data, parentModel, key, collection) => {
            expect(data).toEqual({ value: 1 });
            expect(parentModel).toBeInstanceOf(Foo);
            expect(key).toBe('bar');
            expect(collection).toBeInstanceOf(PureCollection);
            return Bar;
          },
        })
        public bar!: Bar;
      }

      class TestCollection extends Collection {
        public static types = [Foo, Bar];
      }

      const store = new TestCollection();

      const foo = store.add({ bar: [{ value: 1 }] }, Foo);

      expect(foo.bar[0]).toBeInstanceOf(Bar);
    });

    it('should work with a function and class type', () => {
      class Bar extends Model {
        public static type = 'bar';

        @Attribute()
        public value!: number;
      }

      class Foo extends Model {
        public static type = 'foo';

        @Attribute({
          toMany: (data) => {
            expect(data).toEqual({ value: 1 });
            return 'bar';
          },
        })
        public bar!: Bar;
      }

      class TestCollection extends Collection {
        public static types = [Foo, Bar];
      }

      const store = new TestCollection();

      const foo = store.add({ bar: [{ value: 1 }] }, Foo);

      expect(foo.bar[0]).toBeInstanceOf(Bar);
    });

    it('should work with multiple types', () => {
      class Bar extends Model {
        public static type = 'bar';

        @Attribute()
        public value!: number;
      }

      class Baz extends Model {
        public static type = 'baz';

        @Attribute()
        public value!: number;
      }

      class Foo extends Model {
        public static type = 'foo';

        @Attribute({
          toMany: (data: any) => {
            return data.value % 2 === 0 ? Baz : Bar;
          },
        })
        public bar!: Bar;
      }

      class TestCollection extends Collection {
        public static types = [Foo, Bar, Baz];
      }

      const store = new TestCollection();

      const foo = store.add({ bar: [{ value: 1 }, { value: 2 }, { value: 5 }] }, Foo);

      expect(foo.bar[0]).toBeInstanceOf(Bar);
      expect(foo.bar[1]).toBeInstanceOf(Baz);
      expect(foo.bar[2]).toBeInstanceOf(Bar);
    });

    it('should fail on an invalid type', () => {
      class Bar extends Model {
        public static type = 'bar';

        @Attribute()
        public value!: number;
      }

      class Foo extends Model {
        public static type = 'foo';

        @Attribute({
          toMany: (data) => {
            expect(data).toEqual({ value: 1 });
            return 'baz';
          },
        })
        public bar!: Bar;
      }

      class TestCollection extends Collection {
        public static types = [Foo, Bar];
      }

      const store = new TestCollection();

      const foo = store.add({ bar: [{ value: 1 }] }, Foo);

      expect(foo.bar[0]).not.toBeInstanceOf(Bar);
      expect(foo.bar[0]).toBeInstanceOf(Model);
    });
  });
});
