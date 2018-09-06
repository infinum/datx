// tslint:disable:max-classes-per-file

import {autorun, configure, isComputedProp, isObservableArray, runInAction} from 'mobx';

configure({enforceActions: true});

import {
  assignModel,
  cloneModel,
  Collection,
  getModelCollection,
  getModelId,
  getModelType,
  getOriginalModel,
  initModelRef,
  modelToJSON,
  prop,
  PureModel,
  ReferenceType,
  setupModel,
  updateModelId,
} from '../src';
import {storage} from '../src/services/storage';

describe('Model', () => {
  beforeEach(() => {
    // @ts-ignore
    storage.clear();
  });

  describe('Basic features', () => {
    it('should work with initial data', () => {
      class Foo extends PureModel {
        @prop public foo!: number;
        @prop public bar!: number;
        @prop public baz!: number;
      }

      const foo1 = new Foo({foo: 1, bar: 2});

      expect(isComputedProp(foo1, 'foo')).toBe(true);

      expect(foo1.foo).toBe(1);
      expect(foo1.bar).toBe(2);
      expect(foo1.baz).toBe(undefined);

      const foo2 = new Foo();
      let bazValue: number;
      let autorunCount = 0;

      autorun(() => {
        expect(foo2.baz).toBe(bazValue);
        autorunCount++;
      });

      bazValue = 3;
      foo2.baz = 3;

      expect(autorunCount).toBe(2);

      expect(() => {
        assignModel(foo1, 'foo', foo2);
      }).toThrowError('You should save this value as a reference.');
    });

    it('should work with initial data and no decorators', () => {
      // @ts-ignore - Avoiding the TypeScript features on purpose
      const Foo = setupModel(PureModel, {
        fields: {
          bar: undefined,
          baz: undefined,
          foo: undefined,
        },
      });

      // @ts-ignore - Avoiding the TypeScript features on purpose
      const Bar = setupModel(PureModel, {
        type: 'bar',
      });

      // @ts-ignore - Avoiding the TypeScript features on purpose
      expect(() => setupModel(Collection)).toThrowError('This mixin can only decorate models');

      const foo = new Foo({foo: 1, bar: 2});

      expect(foo.foo).toBe(1);
      expect(foo.bar).toBe(2);
      expect(foo.baz).toBe(undefined);

      let bazValue: number;
      let autorunCount = 0;

      autorun(() => {
        expect(foo.baz).toBe(bazValue);
        autorunCount++;
      });

      bazValue = 3;
      // @ts-ignore
      foo.baz = 3;

      expect(autorunCount).toBe(2);
    });

    it('should work with nested data', () => {
      class Foo extends PureModel {
        @prop public foo!: number;
        @prop public bar!: number;
        @prop public baz!: {foobar: number};
      }

      const foo = new Foo({foo: 1, bar: 2, baz: {foobar: 3}});

      let foobarValue: number = 3;
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

      // Trigger the snapshot autorun
      foo.bar++;

      expect(autorunSnapshotCount).toBe(3);
      expect(autorunCount).toBe(2);
    });

    it('should work with default data', () => {
      class Foo extends PureModel {
        @prop.defaultValue(4) public foo!: number;
        @prop.defaultValue(5) public bar!: number;
      }

      const foo = new Foo({bar: 2});

      expect(foo.foo).toBe(4);
      expect(foo.bar).toBe(2);

      let fooValue: number = 4;
      let autorunCount = 0;

      autorun(() => {
        expect(foo.foo).toBe(fooValue);
        autorunCount++;
      });

      fooValue = 3;
      foo.foo = 3;

      expect(autorunCount).toBe(2);
    });

    it('should work with two models', () => {
      class Foo extends PureModel {
        @prop.defaultValue(4) public foo!: number;
        @prop.defaultValue(5) public bar!: number;
      }

      class Bar extends PureModel {
        public foo!: number;
        public bar!: number;
      }

      const bar = new Bar({bar: 2});

      expect(bar.foo).toBe(undefined);
      expect(bar.bar).toBe(2);
    });

    it('should work with extended models', () => {
      class Foo extends PureModel {
        @prop.defaultValue(4) public foo!: number;
        @prop.defaultValue(5) public bar!: number;
      }

      class Bar extends Foo {
        @prop.defaultValue(9) public baz!: number;
      }

      const bar = new Bar({bar: 2});

      expect(bar.foo).toBe(4);
      expect(bar.bar).toBe(2);
      expect(bar.baz).toBe(9);
    });

    it('should support cloning', () => {
      class Foo extends PureModel {
        @prop public foo!: number;
      }

      const foo = new Foo({foo: 1});
      expect(foo.foo).toBe(1);

      const collection = new Collection();
      collection.add(foo);

      const foo2 = cloneModel(foo);
      expect(foo2.foo).toBe(1);
      expect(foo2).toBeInstanceOf(Foo);
      expect(getModelId(foo)).not.toBe(getModelId(foo2));
      expect(getOriginalModel(foo2)).toBe(foo);
      expect(() => getOriginalModel(foo)).toThrowError('The given model is not a clone.');
      collection.remove(foo2);
      expect(() => getOriginalModel(foo2)).toThrowError('The model needs to be in a collection to be referenceable');
    });

    it('should support cloning with additional fields', () => {
      class Foo extends PureModel {
        @prop public foo!: number;
        public bar!: number; // Not observable
      }

      const foo = new Foo({foo: 1});
      assignModel(foo, 'bar', 2);
      expect(foo.foo).toBe(1);
      expect(foo.bar).toBe(2);

      const collection = new Collection();
      collection.add(foo);

      const foo2 = cloneModel(foo);
      expect(foo2.foo).toBe(1);
      expect(foo2.bar).toBe(2);
      expect(foo2).toBeInstanceOf(Foo);
      expect(getModelId(foo)).not.toBe(getModelId(foo2));
      expect(getOriginalModel(foo2)).toBe(foo);
    });

    it('should throw if missing ref models', () => {
      expect(() => {
        class Foo extends PureModel {
          public static type = 'foo';

          // @ts-ignore - Failing on purpose
          @prop.toOne(undefined) public bar!: number;
        }
      }).toThrow('The model type is a required parameter. Do you maybe have a circular dependency?');
    });
  });

  describe('References', () => {
    it('should support basic references', () => {
      class Foo extends PureModel {
        public static type = 'foo';
        @prop.toOne(Foo) public parent?: Foo;
        @prop.defaultValue(1) public foo!: number;
      }

      class TestCollection extends Collection {
        public static types = [Foo];
      }
      const collection = new TestCollection();
      expect(Foo.toJSON()).toBe('foo');

      const foo1 = new Foo({foo: 2});
      collection.add(foo1);

      expect(isComputedProp(foo1, 'parent')).toBe(true);

      const foo2 = collection.add({foo: 3, parent: foo1}, Foo);

      expect(foo2.parent).toBe(foo1);
      expect(foo2.parent && foo2.parent.foo).toBe(2);
      const raw2 = modelToJSON(foo2);
      expect(raw2.parent).toBe(getModelId(foo1));

      const foo3 = collection.add({foo: 4, parent: {foo: 5}}, Foo);
      expect(foo3.parent).toBeInstanceOf(Foo);
      expect(foo3.parent && foo3.parent.foo).toBe(5);
    });

    it('should support basic references with primitive type', () => {
      class Foo extends PureModel {
        public static type = 'foo';
        @prop.toOne('foo') public parent?: Foo;
        @prop.defaultValue(1) public foo!: number;
      }

      class TestCollection extends Collection {
        public static types = [Foo];
      }
      const collection = new TestCollection();

      const foo1 = new Foo({foo: 2});
      collection.add(foo1);

      const foo2 = collection.add({foo: 3, parent: foo1}, Foo);

      expect(foo2.parent).toBe(foo1);
      expect(foo2.parent && foo2.parent.foo).toBe(2);
      const raw2 = modelToJSON(foo2);
      expect(raw2.parent).toBe(getModelId(foo1));

      const foo3 = collection.add({foo: 4, parent: {foo: 5}}, Foo);
      expect(foo3.parent).toBeInstanceOf(Foo);
      expect(foo3.parent && foo3.parent.foo).toBe(5);
    });

    it('should throw if model is not in a collection', () => {
      class Foo extends PureModel {
        @prop.toOne(Foo) public parent?: Foo;
        @prop.defaultValue(1) public foo!: number;
      }

      const foo1 = new Foo({foo: 2});

      expect(() => {
        const foo2 = new Foo({foo: 3, parent: foo1});
      }).toThrowError('The model needs to be in a collection to be referenceable');

      expect(() => {
        foo1.parent = foo1;
      }).toThrowError('The model needs to be in a collection to be referenceable');
    });

    it('should throw if array is given', () => {
      class Foo extends PureModel {
        public static type = 'foo';
        @prop.toOne(Foo) public parent?: Foo;
        @prop.defaultValue(1) public foo!: number;
      }

      class TestCollection extends Collection {
        public static types = [Foo];
      }
      const collection = new TestCollection();

      const foo1 = new Foo({foo: 2});
      collection.add(foo1);

      expect(() => collection.add({foo: 3, parent: [foo1]}, Foo))
        .toThrowError('The reference parent can\'t be an array of values.');

      expect(() => new Foo({foo: 3, parent: [foo1]}))
        .toThrowError('The reference parent can\'t be an array of values.');
    });

    it('should support array references', () => {
      class Foo extends PureModel {
        public static type = 'foo';
        @prop.toMany(Foo) public parent!: Array<Foo>;
        @prop.defaultValue(1) public foo!: number;
      }

      class TestCollection extends Collection {
        public static types = [Foo];
      }
      const collection = new TestCollection();

      const foo1 = collection.add(new Foo({foo: 2}));
      const foo2 = collection.add({foo: 3, parent: [foo1]}, Foo);

      expect(foo2.parent.length).toBe(1);
      expect(foo2.parent && foo2.parent[0].foo).toBe(2);
      const raw2 = modelToJSON(foo2);
      expect(raw2.parent[0]).toBe(getModelId(foo1));
    });

    it('should support array reference modification', () => {
      class Foo extends PureModel {
        public static type = 'foo';
        @prop.toMany(Foo) public parent!: Array<Foo>;
        @prop.defaultValue(1) public foo!: number;
      }
      class TestCollection extends Collection {
        public static types = [Foo];
      }
      const collection = new TestCollection();

      const foo1 = collection.add({foo: 2}, Foo);
      const foo2 = collection.add({foo: 3, parent: [foo1]}, Foo);
      const foo3 = collection.add({foo: 4}, Foo);

      expect(foo2.parent.length).toBe(1);
      expect(foo2.parent && foo2.parent[0].foo).toBe(2);
      const raw2 = modelToJSON(foo2);
      expect(raw2.parent[0]).toBe(getModelId(foo1));

      foo2.parent.push(foo3);
      const raw2b = modelToJSON(foo2);
      expect(raw2b.parent[1]).toBe(getModelId(foo3));

      foo2.parent[2] = foo2;
      const raw2c = modelToJSON(foo2);
      expect(raw2c.parent[2]).toBe(getModelId(foo2));

      foo2.parent.pop();
      const raw2d = modelToJSON(foo2);
      expect(raw2d.parent).toHaveLength(2);
    });

    it('should throw if single item is given', () => {
      class Foo extends PureModel {
        @prop.toMany(Foo) public parent!: Array<Foo>;
        @prop.defaultValue(1) public foo!: number;
      }

      class TestCollection extends Collection {
        public static types = [Foo];
      }

      const store = new TestCollection();

      const foo1 = store.add({foo: 2}, Foo);
      expect(() => store.add({foo: 3, parent: foo1}, Foo))
        .toThrowError('The reference parent must be an array of values.');

      const foo2 = store.add({foo: 3, parent: null}, Foo);
      expect(isObservableArray(foo2.parent)).toBe(true);
      expect(foo2.parent).toHaveLength(0);

      const foo3 = store.add({foo: 3, parent: undefined}, Foo);
      expect(isObservableArray(foo3.parent)).toBe(true);
      expect(foo3.parent).toHaveLength(0);
    });

    it('should support single/array references', () => {
      class Foo extends PureModel {
        public static type = 'foo';
        @prop.toOneOrMany(Foo) public parent!: Foo|Array<Foo>;
        @prop.defaultValue(1) public foo!: number;
      }
      class TestCollection extends Collection {
        public static types = [Foo];
      }
      const collection = new TestCollection();

      const foo1 = collection.add({foo: 2}, Foo);
      const foo2 = collection.add({foo: 3, parent: [foo1]}, Foo);

      expect(isObservableArray(foo2.parent)).toBe(true);
      expect(foo2.parent && foo2.parent[0].foo).toBe(2);
      const raw2 = modelToJSON(foo2);
      expect(raw2.parent[0]).toBe(getModelId(foo1));

      foo2.parent = foo1;
      expect(isObservableArray(foo2.parent)).toBe(false);
      expect(foo2.parent && foo2.parent.foo).toBe(2);
      const raw2b = modelToJSON(foo2);
      expect(raw2b.parent).toBe(getModelId(foo1));

      foo1.foo = 4;
      expect(foo2.parent && foo2.parent.foo).toBe(4);

      assignModel(foo1, 'parent', foo2);
      expect(foo1.parent).toBe(foo2);
    });

    it('should support reference serialization/deserialization', () => {
      class Foo extends PureModel {
        public static type = 'foo';
        @prop.toMany(Foo) public parent!: Array<Foo>;
        @prop.defaultValue(1) public foo!: number;
      }

      class TestCollection extends Collection {
        public static types = [Foo];
      }
      const collection = new TestCollection();

      const foo1 = collection.add(new Foo({foo: 2}));
      const foo2 = collection.add({foo: 3, parent: [foo1]}, Foo);

      expect(foo2.parent.length).toBe(1);
      expect(foo2.parent && foo2.parent[0].foo).toBe(2);

      const raw2 = modelToJSON(foo2);
      expect(raw2.parent[0]).toBe(getModelId(foo1));

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
        @prop.defaultValue(1) public foo!: number;
        public parent!: Array<Foo>;
      }

      class TestCollection extends Collection {
        public static types = [Foo];
      }
      const collection = new TestCollection();

      const foo1 = new Foo({foo: 2});
      const foo2 = new Foo({foo: 3});

      collection.add([foo1, foo2]);

      initModelRef(foo2, 'parent', {model: Foo, type: ReferenceType.TO_MANY}, [foo1]);
      expect(foo2.parent.length).toBe(1);
      expect(foo2.parent && foo2.parent[0].foo).toBe(2);

      const raw2 = modelToJSON(foo2);
      expect(raw2.parent[0]).toBe(getModelId(foo1));

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

        @prop.defaultValue(bar)
        @prop.toOne(Bar)
        public bar?: Bar;

        @prop
        public foo!: number;
      }

      class TestCollection extends Collection {
        public static types = [Foo, Bar];
      }

      const collection = new TestCollection();
      collection.add(bar);

      const foo1 = collection.add({foo: 2}, Foo);
    });

    it('should work if an independent type is defined', () => {
      class Foo extends PureModel {
        public static type = 'foo';

        @prop public type!: string;
      }

      class TestCollection extends Collection {
        public static types = [Foo];
      }

      const collection = new TestCollection();
      const foo = collection.add({type: 'foobar'}, Foo);
      expect(getModelType(foo)).toBe('foo');
      expect(foo.type).toBe('foobar');
    });

    it('should support deep model nesting', () => {
      class Bar extends PureModel {
        public static type = 'bar';

        @prop.identifier public id!: number;
        @prop.toOne('foo') public foo?: Foo;
        @prop public key!: number;
      }

      class Foo extends PureModel {
        public static type = 'foo';

        @prop.identifier public id!: number;
        @prop.toMany(Bar) public bars?: Array<Bar>;
        @prop public key!: number;
      }

      class TestCollection extends Collection {
        public static types = [Foo, Bar];
      }

      const collection = new TestCollection();
      collection.add({
        bars: [{
          foo: {
            id: 4,
            key: 4,
          },
          key: 2,
        }, {
          foo: {
            bars: [{id: 6, key: 6}],
            id: 5,
            key: 5,
          },
          key: 3,
        }],
        id: 1,
        key: 1,
      }, Foo);

      expect(collection.length).toBe(6);

      const foo5 = collection.find(Foo, 5);
      expect(foo5).toBeTruthy();
      if (foo5) {
        expect(foo5.key).toBe(5);
      }

      const bar6 = collection.find(Bar, 6);
      expect(bar6).toBeTruthy();
      if (bar6) {
        expect(bar6.key).toBe(6);
      }
    });

    describe('Back references', () => {
      it('should support basic back references', () => {
        class Foo extends PureModel {
          public static type = 'foo';
          @prop.toOne(Foo) public parent!: Foo;
          @prop.defaultValue(1) public foo!: number;
          @prop.toMany(Foo, 'parent') public children!: Array<Foo>;

          @prop.toMany(Foo) public foos!: Array<Foo>;
          @prop.toMany(Foo, 'foos') public backFoos!: Array<Foo>;
          @prop.toOneOrMany(Foo) public fooRef!: Foo|Array<Foo>;
          @prop.toMany(Foo, 'fooRef') public fooBackRef!: Array<Foo>;
        }

        class TestCollection extends Collection {
          public static types = [Foo];
        }
        const collection = new TestCollection();

        const foo1 = collection.add({foo: 1}, Foo);
        const foo2 = collection.add({foo: 2, parent: foo1}, Foo);
        const foo3 = collection.add({foo: 3, parent: foo1}, Foo);
        const foo4 = collection.add({foo: 4, parent: foo2}, Foo);

        expect(isComputedProp(foo1, 'backFoos')).toBe(true);
        expect(isComputedProp(foo1, 'children')).toBe(true);

        expect(foo1.children).toHaveLength(2);
        expect(foo2.children).toHaveLength(1);
        expect(foo3.children).toHaveLength(0);

        foo1.children.pop();
        expect(foo1.children).toHaveLength(1);
        expect(foo3.parent).toBeNull();

        foo1.children[1] = foo4;
        expect(foo1.children).toHaveLength(2);
        expect(foo4.parent).toBe(foo1);
        expect(foo2.children).toHaveLength(0);

        foo1.children[1] = foo3;
        expect(foo1.children).toHaveLength(2);
        expect(foo3.parent).toBe(foo1);
        expect(foo4.parent).toBeNull();

        updateModelId(foo1, '123');
        expect(modelToJSON(foo3).parent).toBe('123');

        expect(() => foo4.children = [foo1]).toThrowError('Back references are read only');

        foo1.foos = [foo2, foo3];
        foo2.foos = [foo1, foo3, foo4];
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
          @prop.identifier public id!: string;
          @prop.type public type!: string;

          @prop.toOne(Foo) public parent!: Foo;
          @prop.toMany(Foo) public foos!: Array<Foo>;
          @prop.toMany(Foo, 'parent') public children!: Array<Foo>;
        }

        class TestCollection extends Collection {
          public static types = [Foo];
        }

        const store = new TestCollection();

        const foo = new Foo({id: '123', type: '456'});
        expect(foo.id).toBe('123');
        expect(getModelId(foo)).toBe(foo.id);
        expect(foo.type).toBe('456');
        expect(getModelType(foo)).toBe(foo.type);

        expect(() => foo.type = 'bar').toThrowError('Model type can\'t be changed after initialization.');
        expect(() => foo.id = '789')
          .toThrowError('Model ID can\'t be updated directly. Use the `updateModelId` helper function instead.');

        const foo1 = store.add(new Foo({id: '234'}));
        expect(store.length).toBe(1);
        expect(foo1.id).toBe('234');
        expect(getModelCollection(foo1)).toBe(store);

        const foo2 = store.add({parent: foo1, foos: [foo1]}, Foo);
        expect(store.length).toBe(2);
        expect(getModelCollection(foo2)).toBe(store);
        expect(foo2.id).toBeLessThan(0);
        expect(getModelId(foo2)).toBe(foo2.id);
        expect(foo2.type).toBe('foo');
        expect(getModelType(foo2)).toBe('foo');
        expect(modelToJSON(foo2).parent).toBe(foo1.id);
        expect(modelToJSON(foo2).foos).toContain(foo1.id);

        // @ts-ignore
        expect(modelToJSON(foo1).__META__.id).toBe(foo1.id);
        expect(modelToJSON(foo1).id).toBe(foo1.id);

        updateModelId(foo1, '345');
        expect(foo1.id).toBe('345');
        expect(getModelId(foo1)).toBe(foo1.id);
        expect(store.find(Foo, foo1.id)).toBe(foo1);
        expect(foo2.parent).toBe(foo1);
        expect(foo2.foos).toContain(foo1);
        expect(modelToJSON(foo2).parent).toBe(foo1.id);
        expect(modelToJSON(foo2).foos).toContain(foo1.id);

        // @ts-ignore
        expect(modelToJSON(foo1).__META__.id).toBe(foo1.id);
        expect(modelToJSON(foo1).id).toBe(foo1.id);
      });

      it('should work without decorators', () => {
        class FooModel extends PureModel {}
        FooModel.type = 'foo';

        // @ts-ignore - Avoiding the TypeScript features on purpose
        const Foo = setupModel(FooModel, {
          idAttribute: 'id',
          references: {
            bars: {model: 'bar', type: ReferenceType.TO_ONE_OR_MANY},
            children: {model: FooModel, type: ReferenceType.TO_MANY, property: 'parent'},
            foos: {model: FooModel, type: ReferenceType.TO_MANY},
            parent: {model: FooModel, type: ReferenceType.TO_ONE},
          },
          typeAttribute: 'type',
        });

        class TestCollection extends Collection {
          public static types = [Foo];
        }

        const store = new TestCollection();

        const foo = new Foo({id: '123', type: '456'});
        expect(foo.id).toBe('123');
        expect(getModelId(foo)).toBe(foo.id);
        expect(foo.type).toBe('456');
        expect(getModelType(foo)).toBe(foo.type);

        expect(() => foo.type = 'bar').toThrowError('Model type can\'t be changed after initialization.');
        expect(() => foo.id = '789')
          .toThrowError('Model ID can\'t be updated directly. Use the `updateModelId` helper function instead.');

        const foo1 = store.add(new Foo({id: '234'}));
        expect(foo1.id).toBe('234');

        const foo2 = store.add({parent: foo1, foos: [foo1]}, Foo);
        // @ts-ignore - Avoiding the TypeScript features on purpose
        expect(foo2.id).toBeLessThan(0);
        // @ts-ignore - Avoiding the TypeScript features on purpose
        expect(getModelId(foo2)).toBe(foo2.id);
        // @ts-ignore - Avoiding the TypeScript features on purpose
        expect(foo2.type).toBe('foo');
        expect(getModelType(foo2)).toBe('foo');
        expect(modelToJSON(foo2).parent).toBe(foo1.id);
        expect(modelToJSON(foo2).foos).toContain(foo1.id);
      });
    });
  });
});
