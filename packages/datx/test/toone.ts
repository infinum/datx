import { configure } from 'mobx';

import { Bucket, Collection, Model, Attribute, PureCollection } from '../src';

configure({ enforceActions: 'observed' });

describe('ToOne', () => {
  describe('static', () => {
    it('should init a bucket', () => {
      const collection = new Collection();
      const bucketInstance = new Bucket.ToOne(null, collection);

      expect(bucketInstance).toBeInstanceOf(Bucket.ToOne);
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
      const bucketInstance = new Bucket.ToOne(foos[0], collection);

      expect(bucketInstance.value).toBe(foos[0]);
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
      const bucketInstance = new Bucket.ToOne<Foo>({ id: 234, type: 'foo' }, collection);
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
      const bucketInstance = new Bucket.ToOne(foos[0], collection);

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
      const bucketInstance = new Bucket.ToOne(foos[0], collection, true);

      expect(bucketInstance.value).toBe(foos[0]);
      expect(() => {
        bucketInstance.value = foos[1];
      }).toThrowError('[datx exception] This is a read-only bucket');
    });

    it('should work with initial model data and id', () => {
      class Foo extends Model {
        public static type = 'foo';
      }

      class Bar extends Model {
        public static type = 'bar';

        @Attribute({ toOne: Foo })
        public foo!: Foo;
      }

      class AppCollection extends Collection {
        public static types = [Foo, Bar];
      }

      const collection = new AppCollection();

      const bar = collection.add(
        {
          foo: '1',
        },
        Bar,
      );

      expect(bar.foo).toBe(null);

      const foo = collection.add({}, Foo);

      const bar2 = collection.add(
        {
          foo: foo.meta.id,
        },
        Bar,
      );

      expect(bar2.foo).toBe(foo);
    });

    it('should work with initial model data and ref', () => {
      class Foo extends Model {
        public static type = 'foo';
      }

      class Bar extends Model {
        public static type = 'bar';

        @Attribute({ toOne: Foo })
        public foo!: Foo;
      }

      class AppCollection extends Collection {
        public static types = [Foo, Bar];
      }

      const collection = new AppCollection();

      const bar = collection.add(
        {
          foo: { id: '1', type: 'foo' },
        },
        Bar,
      );

      expect(bar.foo).toBe(null);

      const foo = collection.add({}, Foo);

      const bar2 = collection.add(
        {
          foo: { id: foo.meta.id, type: foo.meta.type },
        },
        Bar,
      );

      expect(bar2.foo).toBe(foo);
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
          toOne: (data, parentModel, key, collection) => {
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

      const foo = store.add({ bar: { value: 1 } }, Foo);

      expect(foo.bar).toBeInstanceOf(Bar);
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
          toOne: (data) => {
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

      const foo = store.add({ bar: { value: 1 } }, Foo);

      expect(foo.bar).toBeInstanceOf(Bar);
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
          toOne: (data) => {
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

      const foo = store.add({ bar: { value: 1 } }, Foo);

      expect(foo.bar).not.toBeInstanceOf(Bar);
      expect(foo.bar).toBeInstanceOf(Model);
    });
  });
});
