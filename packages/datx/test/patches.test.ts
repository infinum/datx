import { META_FIELD } from '@datx/utils';

import { Collection, Model, Attribute } from '../src';
import { IPatch } from '../src/interfaces/IPatch';
import { PatchType } from '../src/enums/PatchType';
import { getModelRef } from '../src/helpers/model/utils';

describe('patch', () => {
  describe('model', () => {
    it('should trigger on add, replace and remove', () => {
      const patches: Array<IPatch> = [];
      const model = new Model({
        name: 'Foo',
        nick: 'Bar',
      });

      const unregister = model.onPatch((patch) => patches.push(patch));

      model['name'] = 'FooBar';
      model.assign('age', 42);
      model.assign('nick', undefined);
      model.update({
        height: 180,
        name: 'Bar',
      });

      unregister();
      model['height'] = 200;

      expect(patches).toMatchSnapshot();

      expect(Object.prototype.propertyIsEnumerable.call(model, '__patchListeners')).toBe(false);
    });

    it('should be able to apply patches', () => {
      const model = new Model({
        name: 'Foo',
        nick: 'Bar',
      });

      const modelMeta = { id: model.meta.id, type: model.meta.type };

      const patches: Array<IPatch> = [
        {
          model: modelMeta,
          newValue: { name: 'FooBar' },
          patchType: PatchType.UPDATE,
        },
        {
          model: modelMeta,
          newValue: { age: 42 },
          patchType: PatchType.UPDATE,
        },
        {
          model: modelMeta,
          newValue: { nick: undefined },
          patchType: PatchType.UPDATE,
        },
        {
          model: modelMeta,
          newValue: { height: 180 },
          patchType: PatchType.UPDATE,
        },
        {
          model: modelMeta,
          newValue: { name: 'Bar' },
          patchType: PatchType.UPDATE,
        },
      ] as Array<IPatch<Record<string, any>>>;

      patches.forEach((patch: IPatch) => {
        model.applyPatch(patch);
      });

      expect(model['name']).toBe('Bar');
      expect(model['height']).toBe(180);
      expect(model['age']).toBe(42);
      expect(model['nick']).toBe(undefined);
    });

    it('should be able to undo', () => {
      const patches: Array<IPatch> = [];
      const model = new Model({
        name: 'Foo',
        nick: 'Bar',
      });

      const unregister = model.onPatch((patch) => patches.push(patch));

      model.assign('age', 42);
      model.update({
        height: 180,
        name: 'FooBar',
      });
      model.assign('nick', undefined);

      expect(model['age']).toBe(42);
      expect(model['name']).toBe('FooBar');
      expect(model['nick']).toBe(undefined);

      expect(patches).toMatchSnapshot();

      unregister();
      patches.reverse().forEach((patch) => {
        model.undoPatch(patch);
      });

      expect(model['age']).toBe(undefined);
      expect(model['name']).toBe('Foo');
      expect(model['nick']).toBe('Bar');
    });

    it('should ignore noop changes', () => {
      const patches: Array<IPatch> = [];
      const model = new Model({
        name: 'Foo',
        nick: 'Bar',
      });

      const unregister = model.onPatch((patch) => patches.push(patch));

      model['name'] = 'Foo';
      model.assign('age', 42);
      model.assign('nick', 'Bar');

      unregister();
      model['height'] = 200;

      expect(patches).toMatchSnapshot();
    });
  });

  describe('collection', () => {
    it('should trigger on add, replace and remove', () => {
      const patches: Array<IPatch> = [];
      const model = new Model({
        [META_FIELD]: { type: 'foo', id: 1 },
        name: 'Foo',
        nick: 'Bar',
      });

      const modelMeta = { type: model.meta.type, id: model.meta.id };

      class Foo extends Model {
        static type = 'foo';
      }
      class Store extends Collection {
        static types = [Model, Foo];
      }
      const store = new Store();

      store.onPatch((patch) => patches.push(patch));

      const addSnapshot = model.meta.snapshot;

      store.add(model);

      model['name'] = 'FooBar';
      model.assign('age', 42);
      model.assign('nick', undefined);
      model.update({
        height: 180,
        name: 'Bar',
      });

      const removeSnapshot = model.meta.snapshot;

      store.removeOne('foo', 1);

      model['height'] = 200;

      expect(patches).toEqual([
        {
          model: modelMeta,
          newValue: addSnapshot,
          patchType: PatchType.CRATE,
        },
        {
          model: modelMeta,
          newValue: { name: 'FooBar' },
          oldValue: { name: 'Foo' },
          patchType: PatchType.UPDATE,
        },
        {
          model: modelMeta,
          newValue: { age: 42 },
          oldValue: { age: undefined },
          patchType: PatchType.UPDATE,
        },
        {
          model: modelMeta,
          newValue: { nick: undefined },
          oldValue: { nick: 'Bar' },
          patchType: PatchType.UPDATE,
        },
        {
          model: modelMeta,
          newValue: { height: 180, name: 'Bar' },
          oldValue: { height: undefined, name: 'FooBar' },
          patchType: PatchType.UPDATE,
        },
        {
          model: modelMeta,
          oldValue: removeSnapshot,
          patchType: PatchType.REMOVE,
        },
      ]);
    });

    it('should be able to apply patches', () => {
      const model = new Model({
        [META_FIELD]: { type: 'foo' },
        id: 1,
        name: 'Foo',
        nick: 'Bar',
      });
      const modelMeta = { id: model.meta.id, type: model.meta.type };

      class Foo extends Model {
        static type = 'foo';
      }
      class Store extends Collection {
        static types = [Model, Foo];
      }
      const store = new Store();

      const patches: Array<IPatch> = [
        {
          model: modelMeta,
          newValue: model,
          patchType: PatchType.CRATE,
        },
        {
          model: modelMeta,
          newValue: { name: 'FooBar' },
          patchType: PatchType.UPDATE,
        },
        {
          model: modelMeta,
          newValue: { age: 42 },
          patchType: PatchType.UPDATE,
        },
        {
          model: modelMeta,
          newValue: { nick: undefined },
          patchType: PatchType.UPDATE,
        },
        {
          model: modelMeta,
          newValue: { height: 180 },
          patchType: PatchType.UPDATE,
        },
        {
          model: modelMeta,
          newValue: { name: 'Bar' },
          patchType: PatchType.UPDATE,
        },
        {
          model: modelMeta,
          patchType: PatchType.REMOVE,
        },
      ] as Array<IPatch>;

      patches.forEach((patch: IPatch) => {
        store.applyPatch(patch);
      });

      expect(model['name']).toBe('Bar');
      expect(model['height']).toBe(180);
      expect(model['age']).toBe(42);
      expect(model['nick']).toBe(undefined);
      expect(store.length).toBe(0);
    });
  });

  describe('collection with initial data', () => {
    it('should trigger on add, replace and remove', () => {
      const patches: Array<IPatch> = [];

      class Foo extends Model {
        static type = 'foo';
      }
      class Store extends Collection {
        static types = [Model, Foo];
      }

      const store = new Store([
        {
          [META_FIELD]: { type: 'foo', id: 1 },
          name: 'Foo',
          nick: 'Bar',
        },
      ]);

      store.onPatch((patch) => patches.push(patch));
      const model = store.findAll<Model>('foo')[0];

      expect(model).not.toBe(null);

      if (model) {
        model['name'] = 'FooBar';
        model.assign('age', 42);
        model.assign('nick', undefined);
        model.update({
          height: 180,
          name: 'Bar',
        });

        store.removeOne('foo', 1);

        model['height'] = 200;

        expect(patches).toMatchSnapshot();
      }
    });

    it('should be able to apply patches', () => {
      class Foo extends Model {
        static type = 'foo';
      }
      class Store extends Collection {
        static types = [Model, Foo];
      }

      const store = new Store([
        {
          [META_FIELD]: { type: 'foo' },
          id: 1,
          name: 'Foo',
          nick: 'Bar',
        },
      ]);

      const model = store.findAll<Model>('foo')[0];

      expect(model).not.toBe(null);

      if (model) {
        const modelMeta = { id: model.meta.id, type: model.meta.type };

        const patches: Array<IPatch> = [
          {
            model: modelMeta,
            newValue: { name: 'FooBar' },
            patchType: PatchType.UPDATE,
          },
          {
            model: modelMeta,
            newValue: { age: 42 },
            patchType: PatchType.UPDATE,
          },
          {
            model: modelMeta,
            newValue: { nick: undefined },
            patchType: PatchType.UPDATE,
          },
          {
            model: modelMeta,
            newValue: { height: 180 },
            patchType: PatchType.UPDATE,
          },
          {
            model: modelMeta,
            newValue: { name: 'Bar' },
            patchType: PatchType.UPDATE,
          },
          {
            model: modelMeta,
            patchType: PatchType.REMOVE,
          },
        ] as Array<IPatch>;

        patches.forEach((patch: IPatch) => {
          store.applyPatch(patch);
        });

        expect(model['name']).toBe('Bar');
        expect(model['height']).toBe(180);
        expect(model['age']).toBe(42);
        expect(model['nick']).toBe(undefined);
        expect(store.length).toBe(0);
      }
    });
  });

  describe('references', () => {
    it('should trigger correct patches for ref changes', () => {
      class FooModel extends Model {
        public static type = 'foo';

        @Attribute({ isIdentifier: true })
        public id!: number | string;

        @Attribute({ toOne: 'bar ' })
        public bar!: BarModel | null;
      }

      class BarModel extends Model {
        public static type = 'bar';

        @Attribute({ isIdentifier: true })
        public id!: number | string;
      }

      class TestCollection extends Collection {
        public static types = [FooModel, BarModel];

        public foo!: Array<FooModel>;
      }

      const bar2 = new BarModel({ id: 2 });
      const bar3 = new BarModel({ id: 3 });

      const patches: Array<IPatch> = [];
      const collection = new TestCollection();

      collection.onPatch((patch) => patches.push(patch));

      const model = collection.add<FooModel>(
        {
          bar: bar2,
          id: 1,
        },
        'foo',
      );

      model.bar = bar3;
      model.meta.refs.bar = { id: 2, type: 'bar' };
      model.bar = null;
      model.bar = bar3;

      expect(patches).toMatchSnapshot();
    });

    it('should apply patches correctly for ref changes', () => {
      class BarModel extends Model {
        public static type = 'bar';

        @Attribute({ isIdentifier: true })
        public id!: number | string;
      }

      class FooModel extends Model {
        public static type = 'foo';

        @Attribute({ isIdentifier: true })
        public id!: number | string;

        @Attribute({ toOne: BarModel })
        public bar!: BarModel;
      }

      class TestCollection extends Collection {
        public static types = [FooModel, BarModel];

        public foo!: Array<FooModel>;
      }

      const bar2 = new BarModel({ id: 2 });
      const bar2meta = { type: bar2.meta.type, id: bar2.meta.id };
      const bar3 = new BarModel({ id: 3 });
      const bar3meta = { type: bar3.meta.type, id: bar3.meta.id };
      const model = new FooModel({ id: 1 });
      const modelMeta = { type: model.meta.type, id: model.meta.id };

      const patches: Array<IPatch> = [
        {
          model: bar2meta,
          newValue: bar2,
          patchType: PatchType.CRATE,
        },
        {
          model: modelMeta,
          newValue: model,
          patchType: PatchType.CRATE,
        },
        {
          model: bar3meta,
          newValue: bar3,
          patchType: PatchType.CRATE,
        },
        {
          model: modelMeta,
          newValue: { bar: getModelRef(bar3) },
          oldValue: { bar: undefined },
          patchType: PatchType.UPDATE,
        },
        {
          model: modelMeta,
          newValue: { bar: getModelRef(bar2) },
          oldValue: { bar: getModelRef(bar3) },
          patchType: PatchType.UPDATE,
        },
      ] as Array<IPatch>;

      const collection = new TestCollection();

      patches.forEach((patch: IPatch) => {
        collection.applyPatch(patch);
      });

      expect(collection).toHaveLength(3);
      expect(model.bar).toBe(bar2);
    });

    it('should handle references correctly', () => {
      class Foo extends Model {
        public static type = 'foo';

        @Attribute()
        public val!: number;
      }

      class Bar extends Model {
        public static type = 'bar';

        @Attribute({ toOne: Foo })
        public foo!: Foo;
      }

      class TestStore extends Collection {
        public static types = [Foo, Bar];
      }

      const store = new TestStore();
      const foo = store.add({ val: 1 }, Foo);
      const bar = store.add({ foo }, Bar);

      expect(bar.foo.val).toBe(1);

      const snapshot = bar.toJSON();

      store.removeOne(bar);
      expect(store.findAll(Bar)).toHaveLength(0);
      store.applyPatch({
        patchType: PatchType.CRATE,
        model: {
          id: snapshot?.__META__?.id,
          type: snapshot?.__META__?.type,
        },
        newValue: snapshot,
      });
      const bar2 = store.findAll(Bar)[0];

      expect(bar2).toBeInstanceOf(Bar);
      expect(bar2.foo.val).toBe(1);
    });
  });
});
