/* eslint-disable no-underscore-dangle */
/* eslint-disable max-classes-per-file */

import { autorun, configure, runInAction, isObservableArray, computed, action } from 'mobx';

import { Model, Attribute, PureModel, Collection, ReferenceType, IRawModel } from '../src';
import { updateModelId } from '../src/helpers/model/fields';
import { initModelRef } from '../src/helpers/model/init';
import {
  modelToJSON,
  getModelRef,
  getModelType,
  getModelId,
  getModelCollection,
  cloneModel,
  assignModel,
  getOriginalModel,
} from '../src/helpers/model/utils';

configure({ enforceActions: 'observed' });

describe('Model', () => {
  describe('Basic features', () => {
    it('should work with initial data', () => {
      class Foo extends PureModel {
        @Attribute()
        public foo!: number;

        @Attribute()
        public bar!: number;

        public baz!: number;
      }

      Attribute()(Foo, 'baz');

      const foo1 = new Foo({ foo: 1, bar: 2 });

      expect(Object.prototype.propertyIsEnumerable.call(foo1, 'foo')).toBe(true);
      expect(JSON.stringify(Object.keys(foo1))).toBe(JSON.stringify(['foo', 'bar', 'baz']));

      expect(foo1.foo).toBe(1);
      expect(foo1.bar).toBe(2);
      expect(foo1.baz).toBe(undefined);

      const foo2 = new Foo();
      let bazValue: number | undefined = undefined;
      let autorunCount = 0;

      autorun(() => {
        expect(foo2.baz).toBe(bazValue);
        autorunCount++;
      });

      bazValue = 3;
      runInAction(() => {
        foo2.baz = 3;
      });

      expect(autorunCount).toBe(2);

      expect(() => {
        assignModel(foo1, 'foo', foo2);
      }).toThrowError('You should save this value as a reference.');
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
      }

      const foo = new Foo({ value: '123' });

      expect(foo.value).toBe(123);
      expect(foo.double).toBe(246);

      foo.value = 321;
      expect(foo.value).toBe(321);
      expect(foo.double).toBe(246);

      const snapshot = foo.toJSON();

      expect(snapshot.value).toBe('TEST:321');
      expect(snapshot.double).toBe('TEST:246:321');
    });

    it('should work with property parsers/serializers for extended classes', () => {
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

        @Attribute({ defaultValue: 1 })
        public one!: number;
      }

      class Bar extends Foo {}

      const foo = new Bar({ value: '123' });

      expect(foo.one).toBe(1);
      expect(foo.value).toBe(123);
      expect(foo.double).toBe(246);

      foo.value = 321;
      expect(foo.value).toBe(321);
      expect(foo.double).toBe(246);

      const snapshot = foo.toJSON();

      expect(snapshot.value).toBe('TEST:321');
      expect(snapshot.double).toBe('TEST:246:321');
    });

    it('should work with valueOf and toString', () => {
      class Foo extends Model {
        @Attribute()
        public foo!: number;

        @Attribute()
        public bar!: number;

        @Attribute()
        public baz!: number;
      }

      const foo1 = new Foo({ foo: 1, bar: 2 });

      expect(foo1.valueOf()).toMatchSnapshot();
      expect(foo1.toString()).toMatchSnapshot();
    });

    it('should work with initial data and no decorators', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        public foo!: number;

        public bar!: number;

        public baz!: number;
      }

      Attribute()(Foo, 'foo');
      Attribute()(Foo, 'bar');
      Attribute()(Foo, 'baz');

      const foo = new Foo({ foo: 1, bar: 2 });

      expect(foo.foo).toBe(1);
      expect(foo.bar).toBe(2);
      expect(foo.baz).toBe(undefined);

      let bazValue: number | undefined = undefined;
      let autorunCount = 0;

      autorun(() => {
        expect(foo.baz).toBe(bazValue);
        autorunCount++;
      });

      bazValue = 3;
      // @ts-ignore
      runInAction(() => {
        foo.baz = 3;
      });

      expect(autorunCount).toBe(2);
    });

    it('should work with id getters', () => {
      class Foo extends Model {
        @Attribute()
        public foo!: number;

        @Attribute()
        public bar!: number;

        @Attribute()
        public baz!: number;

        @computed
        get id(): number | string {
          return this.meta.id;
        }

        @computed
        get id2(): number | string {
          return getModelId(this);
        }
      }
      const foo1 = new Foo({ foo: 1, bar: 2 });
      const foo2 = new Foo({ foo: 2, bar: 4 });
      const foo3 = new Foo({ foo: 3, bar: 3 });

      expect(foo1.meta.id).toBe(getModelId(foo1));
      expect(foo1.id).toBe(getModelId(foo1));
      expect(foo1.id2).toBe(getModelId(foo1));
      expect(foo2.meta.id).toBe(getModelId(foo2));
      expect(foo2.id).toBe(getModelId(foo2));
      expect(foo2.id2).toBe(getModelId(foo2));
      expect(foo3.meta.id).toBe(getModelId(foo3));
      expect(foo3.id).toBe(getModelId(foo3));
      expect(foo3.id2).toBe(getModelId(foo3));
      expect(foo1.id).not.toBe(foo2.id);
      expect(foo1.id).not.toBe(foo3.id);
      expect(foo2.id).not.toBe(foo3.id);
    });

    it('should work with nested data', () => {
      class Foo extends PureModel {
        @Attribute()
        public foo!: number;

        @Attribute()
        public bar!: number;

        @Attribute()
        public baz!: { foobar: number };
      }

      const foo = new Foo({ foo: 1, bar: 2, baz: { foobar: 3 } });

      let foobarValue = 3;
      let autorunCount = 0;
      let autorunSnapshotCount = 0;

      autorun(() => {
        expect(foo.baz.foobar).toBe(foobarValue);
        autorunCount++;
      });

      autorun(() => {
        expect(modelToJSON(foo).baz.foobar).toBe(foobarValue);
        autorunSnapshotCount++;
      });

      // Trigger both autoruns
      foobarValue = 4;
      runInAction(() => {
        foo.baz.foobar = 4;
      });

      runInAction(() => {
        // Trigger the snapshot autorun
        foo.bar++;
      });

      // Trigger both autoruns
      foobarValue = 5;
      runInAction(() => {
        foo.baz.foobar = 5;
      });

      expect(autorunCount).toBe(3);
      expect(autorunSnapshotCount).toBe(4);
    });

    it('should work with default data', () => {
      class Foo extends PureModel {
        @Attribute({ defaultValue: 4 })
        public foo!: number;

        @Attribute({ defaultValue: 5 })
        public bar!: number;
      }

      const foo = new Foo({ bar: 2 });

      expect(foo.foo).toBe(4);
      expect(foo.bar).toBe(2);

      let fooValue = 4;
      let autorunCount = 0;

      autorun(() => {
        expect(foo.foo).toBe(fooValue);
        autorunCount++;
      });

      runInAction(() => {
        fooValue = 3;
        foo.foo = 3;
      });

      expect(autorunCount).toBe(2);
    });

    it('should work with two models', () => {
      class Bar extends PureModel {
        public foo!: number;

        public bar!: number;
      }

      const bar = new Bar({ bar: 2 });

      expect(bar.foo).toBe(undefined);
      expect(bar.bar).toBe(2);
    });

    it('should work with extended models', () => {
      class Foo extends PureModel {
        @Attribute({ defaultValue: 4 })
        public foo!: number;

        @Attribute({ defaultValue: 5 })
        public bar!: number;
      }

      class Bar extends Foo {
        @Attribute({ defaultValue: 9 })
        public baz!: number;
      }

      const bar = new Bar({ bar: 2 });

      expect(bar.foo).toBe(4);
      expect(bar.bar).toBe(2);
      expect(bar.baz).toBe(9);
    });

    it('should support cloning', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute()
        public foo!: number;
      }
      class AppStore extends Collection {
        public static types = [Foo];
      }
      const foo = new Foo({ foo: 1 });

      expect(foo.foo).toBe(1);
      const collection = new AppStore();

      collection.add(foo);
      const foo2 = cloneModel(foo);

      expect(foo2.foo).toBe(1);
      expect(foo2).toBeInstanceOf(Foo);
      expect(getModelId(foo)).not.toBe(getModelId(foo2));
      expect(getOriginalModel(foo2)).toBe(foo);
      expect(() => getOriginalModel(foo)).toThrowError('The given model is not a clone.');
      collection.removeOne(foo2);
      expect(() => getOriginalModel(foo2)).toThrowError(
        'The model needs to be in a collection to be referenceable',
      );
    });

    it('should support cloning with additional fields', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute()
        public foo!: number;

        public bar!: number; // Not observable
      }
      class AppStore extends Collection {
        public static types = [Foo];
      }
      const foo = new Foo({ foo: 1 });

      assignModel(foo, 'bar', 2);
      expect(foo.foo).toBe(1);
      expect(foo.bar).toBe(2);
      const collection = new AppStore();

      collection.add(foo);
      const foo2 = cloneModel(foo);

      expect(foo2.foo).toBe(1);
      expect(foo2.bar).toBe(2);
      expect(foo2).toBeInstanceOf(Foo);
      expect(getModelId(foo)).not.toBe(getModelId(foo2));
      expect(getOriginalModel(foo2)).toBe(foo);
    });
  });

  describe('References', () => {
    it('should support basic references', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute({ toOne: Foo })
        public parent?: Foo | null;

        @Attribute({ defaultValue: 1 })
        public foo!: number;
      }

      class TestCollection extends Collection {
        public static types = [Foo];
      }
      const collection = new TestCollection();

      expect(Foo.toJSON()).toBe('foo');

      const foo1 = new Foo({ foo: 2 });

      collection.add(foo1);

      const foo2 = collection.add({ foo: 3, parent: foo1 }, Foo);

      expect(foo2.parent).toBe(foo1);
      expect(foo2.parent && foo2.parent.foo).toBe(2);
      const raw2 = modelToJSON(foo2);

      expect(raw2.parent).toEqual(getModelRef(foo1));

      const foo3 = collection.add({ foo: 4, parent: { foo: 5 } }, Foo);

      expect(foo3.parent).toBeInstanceOf(Foo);
      expect(foo3.parent && foo3.parent.foo).toBe(5);

      let autorunCount = 0;
      let { parent } = foo3;

      autorun(() => {
        autorunCount++;
        expect(foo3.parent).toBe(parent);
      });

      parent = null;
      runInAction(() => {
        foo3.parent = null;
      });

      expect(autorunCount).toBe(2);
    });

    it('should support basic references with primitive type', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute({ toOne: 'foo' })
        public parent?: Foo;

        @Attribute({ defaultValue: 1 })
        public foo!: number;
      }

      class TestCollection extends Collection {
        public static types = [Foo];
      }
      const collection = new TestCollection();

      const foo1 = new Foo({ foo: 2 });

      collection.add(foo1);

      const foo2 = collection.add({ foo: 3, parent: foo1 }, Foo);

      expect(foo2.parent).toBe(foo1);
      expect(foo2.parent && foo2.parent.foo).toBe(2);
      const raw2 = modelToJSON(foo2);

      expect(raw2.parent).toEqual(getModelRef(foo1));

      const foo3 = collection.add({ foo: 4, parent: { foo: 5 } }, Foo);

      expect(foo3.parent).toBeInstanceOf(Foo);
      expect(foo3.parent && foo3.parent.foo).toBe(5);
    });

    it('should throw if model is not in a collection', () => {
      class Foo extends PureModel {
        @Attribute({ toOne: Foo })
        public parent?: Foo;

        @Attribute({ defaultValue: 1 })
        public foo!: number;
      }

      const foo1 = new Foo({ foo: 2 });

      expect(() => {
        // eslint-disable-next-line no-new
        new Foo({ foo: 3, parent: foo1 });
      }).toThrowError('The model needs to be in a collection to be referenceable');

      expect(
        action(() => {
          foo1.parent = foo1;
        }),
      ).toThrowError('The model needs to be in a collection to be referenceable');
    });

    it('should throw if array is given', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute({ toOne: Foo })
        public parent?: Foo;

        @Attribute({ defaultValue: 1 })
        public foo!: number;
      }

      class TestCollection extends Collection {
        public static types = [Foo];
      }
      const collection = new TestCollection();

      const foo1 = new Foo({ foo: 2 });

      collection.add(foo1);

      expect(() => collection.add({ foo: 3, parent: [foo1] }, Foo)).toThrowError(
        "[datx exception] The reference can't be an array of values.",
      );

      expect(() => new Foo({ foo: 3, parent: [foo1] })).toThrowError(
        '[datx exception] The model needs to be in a collection to be referenceable',
      );
    });

    it('should support array references', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute({ toMany: Foo })
        public parent!: Array<Foo>;

        @Attribute({ defaultValue: 1 })
        public foo!: number;
      }

      class TestCollection extends Collection {
        public static types = [Foo];
      }
      const collection = new TestCollection();

      const foo1 = collection.add(new Foo({ foo: 2 }));
      const foo2 = collection.add({ foo: 3, parent: [foo1] }, Foo);

      expect(foo2.parent.length).toBe(1);
      expect(foo2.parent && foo2.parent[0].foo).toBe(2);
      const raw2 = modelToJSON(foo2);

      expect(raw2.parent[0]).toEqual(getModelRef(foo1));
    });

    it('should support array reference modification', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute({ toMany: Foo })
        public parent!: Array<Foo>;

        @Attribute({ defaultValue: 1 })
        public foo!: number;
      }
      class TestCollection extends Collection {
        public static types = [Foo];
      }
      const collection = new TestCollection();

      const foo1 = collection.add({ foo: 2 }, Foo);
      const foo2 = collection.add({ foo: 3, parent: [foo1] }, Foo);
      const foo3 = collection.add({ foo: 4 }, Foo);

      expect(foo2.parent.length).toBe(1);
      expect(foo2.parent && foo2.parent[0].foo).toBe(2);
      const raw2 = modelToJSON(foo2);

      expect(raw2.parent[0]).toEqual(getModelRef(foo1));

      foo2.parent.push(foo3);
      const raw2b = modelToJSON(foo2);

      expect(raw2b.parent[1]).toEqual(getModelRef(foo3));

      foo2.parent[2] = foo2;
      const raw2c = modelToJSON(foo2);

      expect(raw2c.parent[2]).toEqual(getModelRef(foo2));

      foo2.parent.pop();
      const raw2d = modelToJSON(foo2);

      expect(raw2d.parent).toHaveLength(2);
    });

    it('should throw if single item is given', () => {
      class Foo extends PureModel {
        @Attribute({ toMany: Foo })
        public parent!: Array<Foo>;

        @Attribute({ defaultValue: 1 })
        public foo!: number;
      }

      class TestCollection extends Collection {
        public static types = [Foo];
      }

      const store = new TestCollection();

      const foo1 = store.add({ foo: 2 }, Foo);

      expect(() => store.add({ foo: 3, parent: foo1 }, Foo)).toThrowError(
        '[datx exception] The reference must be an array of values.',
      );

      const foo2 = store.add({ foo: 3, parent: null }, Foo);

      expect(isObservableArray(foo2.parent)).toBe(true);
      expect(foo2.parent).toHaveLength(0);

      const foo3 = store.add({ foo: 3, parent: undefined }, Foo);

      expect(isObservableArray(foo3.parent)).toBe(true);
      expect(foo3.parent).toHaveLength(0);
    });

    it('should support single/array references', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute({ toOneOrMany: Foo })
        public parent!: Foo | Array<Foo>;

        @Attribute({ defaultValue: 1 })
        public foo!: number;
      }
      class TestCollection extends Collection {
        public static types = [Foo];
      }
      const collection = new TestCollection();

      const foo1 = collection.add({ foo: 2 }, Foo);
      const foo2 = collection.add({ foo: 3, parent: [foo1] }, Foo);

      expect(isObservableArray(foo2.parent)).toBe(true);
      expect(foo2.parent && foo2.parent[0].foo).toBe(2);
      const raw2 = modelToJSON(foo2);

      expect(raw2.parent[0]).toEqual(getModelRef(foo1));

      foo2.parent = foo1;
      expect(isObservableArray(foo2.parent)).toBe(false);
      expect(foo2.parent && foo2.parent.foo).toBe(2);
      const raw2b = modelToJSON(foo2);

      expect(raw2b.parent).toEqual(getModelRef(foo1));

      runInAction(() => {
        foo1.foo = 4;
      });
      expect(foo2.parent && foo2.parent.foo).toBe(4);

      assignModel(foo1, 'parent', foo2);
      expect(foo1.parent).toBe(foo2);
    });

    it('should support reference serialization/deserialization', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute({ toMany: Foo })
        public parent!: Array<Foo>;

        @Attribute({ defaultValue: 1 })
        public foo!: number;
      }

      class TestCollection extends Collection {
        public static types = [Foo];
      }
      const collection = new TestCollection();

      const foo1 = collection.add(new Foo({ foo: 2 }));
      const foo2 = collection.add({ foo: 3, parent: [foo1] }, Foo);

      expect(foo2.parent.length).toBe(1);
      expect(foo2.parent && foo2.parent[0].foo).toBe(2);

      const raw2 = modelToJSON(foo2);

      expect(raw2.parent[0]).toEqual(getModelRef(foo1));

      // @ts-ignore
      delete raw2.__META__.id;
      const foo3 = collection.add(raw2, Foo);

      expect(foo3.parent.length).toBe(1);
      expect(foo3.parent && foo3.parent[0].foo).toBe(2);

      const foo4 = cloneModel(foo2);

      expect(foo4.parent.length).toBe(1);
      expect(foo4.parent && foo4.parent[0].foo).toBe(2);

      foo4.parent[0] = foo1;
      expect(foo4.parent).toContain(foo1);
    });

    it('should support custom reference serialization/deserialization', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute({ defaultValue: 1 })
        public foo!: number;

        public parent!: Array<Foo>;
      }

      class TestCollection extends Collection {
        public static types = [Foo];
      }
      const collection = new TestCollection();

      const foo1 = new Foo({ foo: 2 });
      const foo2 = new Foo({ foo: 3 });

      collection.add([foo1, foo2]);

      initModelRef(foo2, 'parent', { model: Foo.type, type: ReferenceType.TO_MANY }, [foo1]);
      expect(foo2.parent.length).toBe(1);
      expect(foo2.parent && foo2.parent[0].foo).toBe(2);

      const raw2: IRawModel = JSON.parse(JSON.stringify(modelToJSON(foo2)));

      expect(raw2.parent[0]).toEqual(getModelRef(foo1));

      // @ts-ignore
      delete raw2.__META__.id;
      const foo3 = collection.add(raw2, Foo);

      expect(foo3.parent.length).toBe(1);
      expect(foo3.parent && foo3.parent[0].foo).toBe(2);

      const foo4 = cloneModel(foo2);

      expect(foo4.parent.length).toBe(1);
      expect(foo4.parent && foo4.parent[0].foo).toBe(2);
    });

    it('should support default references', () => {
      class Bar extends PureModel {
        public static type = 'bar';
      }

      const bar = new Bar({});

      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute({ defaultValue: bar })
        @Attribute({ toOne: Bar })
        public bar?: Bar;

        @Attribute()
        public foo!: number;
      }

      class TestCollection extends Collection {
        public static types = [Foo, Bar];
      }

      const collection = new TestCollection();

      collection.add(bar);

      collection.add({ foo: 2 }, Foo);
    });

    it('should work if an independent type is defined', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute()
        public type!: string;
      }

      class TestCollection extends Collection {
        public static types = [Foo];
      }

      const collection = new TestCollection();
      const foo = collection.add({ type: 'foobar' }, Foo);

      expect(getModelType(foo)).toBe('foo');
      expect(foo.type).toBe('foobar');
    });

    it('should support deep model nesting', () => {
      class Bar extends PureModel {
        public static type = 'bar';

        @Attribute({ isIdentifier: true })
        public id!: number;

        @Attribute({ toOne: 'foo' })
        public foo?: Foo;

        @Attribute()
        public key!: number;
      }

      class Foo extends PureModel {
        public static type = 'foo';

        @Attribute({ isIdentifier: true })
        public id!: number;

        @Attribute({ toMany: Bar })
        public bars?: Array<Bar>;

        @Attribute()
        public key!: number;
      }

      class TestCollection extends Collection {
        public static types = [Foo, Bar];
      }

      const collection = new TestCollection();

      collection.add(
        {
          bars: [
            {
              foo: {
                id: 4,
                key: 4,
              },
              key: 2,
            },
            {
              foo: {
                bars: [{ id: 6, key: 6 }],
                id: 5,
                key: 5,
              },
              key: 3,
            },
          ],
          id: 1,
          key: 1,
        },
        Foo,
      );

      expect(collection.length).toBe(6);

      const foo5 = collection.findOne(Foo, 5);

      expect(foo5).toBeTruthy();
      if (foo5) {
        expect(foo5.key).toBe(5);
      }

      const bar6 = collection.findOne(Bar, 6);

      expect(bar6).toBeTruthy();
      if (bar6) {
        expect(bar6.key).toBe(6);
      }
    });

    describe('Back references', () => {
      it('should support basic back references', () => {
        class Foo extends PureModel {
          public static type = 'foo';

          @Attribute({ toOne: Foo })
          public parent!: Foo;

          @Attribute({ defaultValue: 1 })
          public foo!: number;

          @Attribute({ toMany: Foo, referenceProperty: 'parent' })
          public children!: Array<Foo>;

          @Attribute({ toMany: Foo })
          public foos!: Array<Foo>;

          @Attribute({ toMany: Foo, referenceProperty: 'foos' })
          public backFoos!: Array<Foo>;

          @Attribute({ toOneOrMany: Foo })
          public fooRef!: Foo | Array<Foo>;

          @Attribute({ toMany: Foo, referenceProperty: 'fooRef' })
          public fooBackRef!: Array<Foo>;
        }

        class TestCollection extends Collection {
          public static types = [Foo];
        }
        const collection = new TestCollection();

        const foo1 = collection.add({ foo: 1 }, Foo);
        const foo2 = collection.add({ foo: 2, parent: foo1 }, Foo);
        const foo3 = collection.add({ foo: 3, parent: foo1 }, Foo);
        const foo4 = collection.add({ foo: 4, parent: foo2 }, Foo);

        let autorunCount = 0;
        let expectedCount = 2;

        autorun(() => {
          autorunCount++;
          expect(foo1.children).toHaveLength(expectedCount);
        });

        expect(foo1.children).toHaveLength(2);
        expect(foo2.children).toHaveLength(1);
        expect(foo3.children).toHaveLength(0);

        expectedCount = 1;
        runInAction(() => {
          foo1.children.pop();
        });

        expect(foo1.children).toHaveLength(1);
        expect(foo3.parent).toBeNull();
        expect(autorunCount).toBe(2);

        expectedCount = 2;
        runInAction(() => {
          foo1.children[1] = foo4;
        });
        expect(foo1.children).toHaveLength(2);
        expect(foo4.parent).toBe(foo1);
        expect(foo2.children).toHaveLength(0);

        runInAction(() => {
          foo1.children[1] = foo3;
        });
        expect(foo1.children).toHaveLength(2);
        expect(foo3.parent).toBe(foo1);
        expect(foo4.parent).toBeNull();
        expect(autorunCount).toBe(4);

        updateModelId(foo1, '123');
        expect(modelToJSON(foo3).parent).toEqual({ id: '123', type: 'foo' });

        expect(() => {
          foo4.children = [foo1];
        }).toThrowError('Back references are read only');

        runInAction(() => {
          foo1.foos = [foo2, foo3];
          foo2.foos = [foo1, foo3, foo4];
        });
        expect(foo1.backFoos).toHaveLength(1);
        expect(foo1.backFoos).toContain(foo2);
        expect(foo3.backFoos).toHaveLength(2);
        expect(foo3.backFoos).toContain(foo1);
        expect(foo3.backFoos).toContain(foo2);

        foo3.backFoos.push(foo4);
        expect(foo4.foos).toHaveLength(1);
        expect(foo4.foos).toContain(foo3);

        foo3.backFoos.shift();
        expect(foo1.foos).toHaveLength(1);
        expect(foo1.foos).toContain(foo2);

        foo3.fooRef = [foo4];
        expect(foo4.fooBackRef).toHaveLength(1);
        expect(foo4.fooBackRef).toContain(foo3);

        foo3.fooRef.push(foo1);
        foo3.fooRef.shift();
        expect(foo3.fooRef).toHaveLength(1);
        expect(foo3.fooRef).toContain(foo1);

        foo4.fooBackRef.push(foo1);
        expect(foo1.fooRef).toBe(foo4);
        foo4.fooBackRef.pop();
        expect(foo1.fooRef).toBeNull();

        foo4.fooRef = foo1;
        foo3.fooRef = foo1;
        foo2.fooRef = foo1;
        expect(foo1.fooBackRef).toHaveLength(3);

        const toRemove = foo1.fooBackRef[1];

        // @ts-ignore
        foo1.fooBackRef[1] = undefined;
        expect(foo1.fooBackRef).not.toContain(toRemove);

        foo1.fooBackRef[1] = foo1;
        expect(foo1.fooRef).toBe(foo1);
      });
    });

    describe('Custom id & type', () => {
      it('Should work for the basic use case', () => {
        class Foo extends PureModel {
          public static type = 'foo';

          @Attribute({ isIdentifier: true })
          public id!: string;

          @Attribute({ isType: true })
          public type!: string;

          @Attribute({ toOne: Foo })
          public parent!: Foo;

          @Attribute({ toMany: Foo })
          public foos!: Array<Foo>;

          @Attribute({ toMany: Foo, referenceProperty: 'parent' })
          public children!: Array<Foo>;
        }

        class TestCollection extends Collection {
          public static types = [Foo];
        }

        const store = new TestCollection();

        const foo = new Foo({ id: '123', type: '456' });

        expect(foo.id).toBe('123');
        expect(getModelId(foo)).toBe(foo.id);
        expect(foo.type).toBe('456');
        expect(getModelType(foo)).toBe(foo.type);

        expect(
          action(() => {
            foo.type = 'bar';
          }),
        ).toThrowError("Model type can't be changed after initialization.");
        expect(
          action(() => {
            foo.id = '789';
          }),
        ).toThrowError(
          "Model ID can't be updated directly. Use the `updateModelId` helper function instead.",
        );

        const foo1 = store.add(new Foo({ id: '234' }));

        expect(store.length).toBe(1);
        expect(foo1.id).toBe('234');
        expect(getModelCollection(foo1)).toBe(store);

        const foo2 = store.add({ parent: foo1, foos: [foo1] }, Foo);

        expect(store.length).toBe(2);
        expect(getModelCollection(foo2)).toBe(store);
        expect(foo2.id).toBeLessThan(0);
        expect(getModelId(foo2)).toBe(foo2.id);
        expect(foo2.type).toBe('foo');
        expect(getModelType(foo2)).toBe('foo');
        expect(modelToJSON(foo2).parent).toEqual(getModelRef(foo1));
        expect(modelToJSON(foo2).foos).toContainEqual(getModelRef(foo1));

        // @ts-ignore
        expect(modelToJSON(foo1).__META__.id).toBe(foo1.id);
        expect(modelToJSON(foo1).id).toBe(foo1.id);

        updateModelId(foo1, '345');
        expect(foo1.id).toBe('345');
        expect(getModelId(foo1)).toBe(foo1.id);
        expect(store.findOne(Foo, foo1.id)).toBe(foo1);
        expect(foo2.parent).toBe(foo1);
        expect(foo2.foos).toContain(foo1);
        expect(modelToJSON(foo2).parent).toEqual(getModelRef(foo1));
        expect(modelToJSON(foo2).foos).toContainEqual(getModelRef(foo1));

        // @ts-ignore
        expect(modelToJSON(foo1).__META__.id).toBe(foo1.id);
        expect(modelToJSON(foo1).id).toBe(foo1.id);
      });

      it('should work without decorators', () => {
        class Foo extends PureModel {
          public id!: number;

          public type!: string;
        }
        Foo.type = 'foo';

        Attribute({ toMany: Foo, referenceProperty: 'parent' })(Foo, 'children');
        Attribute({ toOneOrMany: 'bar' })(Foo, 'bars');
        Attribute({ toMany: Foo })(Foo, 'foos');
        Attribute({ toOne: Foo })(Foo, 'parent');
        Attribute({ isType: true })(Foo, 'type');
        Attribute({ isIdentifier: true })(Foo, 'id');

        class TestCollection extends Collection {
          public static types = [Foo];
        }

        const store = new TestCollection();

        const foo = new Foo({ id: 123, type: '456' });

        expect(foo.id).toBe(123);
        expect(getModelId(foo)).toBe(foo.id);
        expect(foo.type).toBe('456');
        expect(getModelType(foo)).toBe(foo.type);

        expect(
          action(() => {
            foo.type = 'bar';
          }),
        ).toThrowError("Model type can't be changed after initialization.");
        expect(() => {
          foo.id = 789;
        }).toThrowError(
          "Model ID can't be updated directly. Use the `updateModelId` helper function instead.",
        );

        const foo1 = store.add(new Foo({ id: 234 }));

        expect(foo1.id).toBe(234);

        const foo2 = store.add({ parent: foo1, foos: [foo1] }, Foo);

        // @ts-ignore - Avoiding the TypeScript features on purpose
        expect(foo2.id).toBeLessThan(0);
        // @ts-ignore - Avoiding the TypeScript features on purpose
        expect(getModelId(foo2)).toBe(foo2.id);
        // @ts-ignore - Avoiding the TypeScript features on purpose
        expect(foo2.type).toBe('foo');
        expect(getModelType(foo2)).toBe('foo');
        expect(modelToJSON(foo2).parent).toEqual(getModelRef(foo1));
        expect(modelToJSON(foo2).foos).toContainEqual(getModelRef(foo1));
      });
    });
  });
});
