import testMobx from './mobx';

import { Bucket, Collection, Model, Attribute, PureCollection } from '../src';

// @ts-ignore
testMobx.configure({ enforceActions: 'observed' });

describe('ToOneOrMany', () => {
  describe('ToOneOrMany with lists', () => {
    it('should init a ToOneOrMany bucket', () => {
      const collection = new Collection();
      const bucketInstance = new Bucket.ToOneOrMany([], collection);

      expect(bucketInstance).toBeInstanceOf(Bucket.ToOneOrMany);
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
      const bucketInstance = new Bucket.ToOneOrMany(foos, collection);

      expect(bucketInstance.value).toBeInstanceOf(Array);
      if (bucketInstance.value instanceof Array) {
        expect(bucketInstance.value).toHaveLength(2);
        expect(bucketInstance.value[0]).toBeInstanceOf(Foo);
        expect(bucketInstance.value[1]).toBeInstanceOf(Foo);
        expect(bucketInstance.value[0]).toBe(foos[0]);
      }
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
      const bucketInstance = new Bucket.ToOneOrMany([...foos, ...bars], collection);

      expect(bucketInstance.value).toBeInstanceOf(Array);
      if (bucketInstance.value instanceof Array) {
        expect(bucketInstance.value).toHaveLength(3);
        expect(bucketInstance.value[0]).toBeInstanceOf(Foo);
        expect(bucketInstance.value[2]).toBeInstanceOf(Bar);
        expect(bucketInstance.value[0]).toBe(foos[0]);
      }
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
      const bucketInstance = new Bucket.ToOneOrMany<Foo>(
        [
          { id: '987', type: 'foo' },
          { id: '123', type: 'foo' },
          { id: '234', type: 'foo' },
        ],
        collection,
      );
      const foos = collection.add([{ id: '123' }, { id: '234' }], Foo);

      expect(collection.length).toBe(2);
      expect(bucketInstance.value).toBeInstanceOf(Array);
      if (bucketInstance.value instanceof Array) {
        expect(bucketInstance.value.length).toBe(2);
        expect(bucketInstance.snapshot).toBeInstanceOf(Array);
        expect(bucketInstance.snapshot).toHaveLength(3);
        expect(bucketInstance.value[0]).toBeInstanceOf(Foo);
        expect(bucketInstance.value[1]).toBeInstanceOf(Foo);
        expect(bucketInstance.value[0]).toBe(foos[0]);
      }
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
      const bucketInstance = new Bucket.ToOneOrMany<Foo | Bar>([...foos, ...bars], collection);

      expect(bucketInstance.value).toBeInstanceOf(Array);
      if (bucketInstance.value instanceof Array) {
        expect(bucketInstance.value).toHaveLength(3);
        expect(bucketInstance.value[0]).toBeInstanceOf(Foo);
        expect(bucketInstance.value[2]).toBeInstanceOf(Bar);
        expect(bucketInstance.value[0]).toBe(foos[0]);

        bucketInstance.value.shift();
        expect(bucketInstance.value).toHaveLength(2);
        expect(bucketInstance.value[0]).toBe(foos[1]);

        bucketInstance.value = foos;
        expect(bucketInstance.value).toHaveLength(2);
        expect(bucketInstance.value[0]).toBe(foos[0]);

        bucketInstance.value = bars[0];
        expect(bucketInstance.value).toBeInstanceOf(Bar);
      }
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
            toOneOrMany: (data, parentModel, key, collection) => {
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
            toOneOrMany: (data) => {
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
            toOneOrMany: (data: any) => {
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
            toOneOrMany: (data) => {
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

  describe('ToOneOrMany with a single item', () => {
    it('should init a ToOneOrMany bucket', () => {
      const collection = new Collection();
      const bucketInstance = new Bucket.ToOneOrMany([], collection);

      expect(bucketInstance).toBeInstanceOf(Bucket.ToOneOrMany);
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
      const bucketInstance = new Bucket.ToOneOrMany(foos[0], collection);

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
      const bucketInstance = new Bucket.ToOneOrMany<Foo>({ id: '234', type: 'foo' }, collection);
      const foos = collection.add([{ id: '123' }, { id: '234' }], Foo);

      expect(collection.length).toBe(2);
      expect(bucketInstance.snapshot).not.toBeInstanceOf(Array);
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
      const bucketInstance = new Bucket.ToOneOrMany(foos[0], collection);

      expect(bucketInstance.value).toBe(foos[0]);
      bucketInstance.value = foos[1];
      expect(bucketInstance.value).toBe(foos[1]);

      bucketInstance.value = foos;
      expect(bucketInstance.value).toBeInstanceOf(Array);
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
            toOneOrMany: (data, parentModel, key, collection) => {
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
            toOneOrMany: (data) => {
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
            toOneOrMany: (data) => {
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
});
