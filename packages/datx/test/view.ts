// tslint:disable:max-classes-per-file

import { autorun, configure, runInAction } from 'mobx';

configure({ enforceActions: 'observed' });

import {
  Collection,
  Model,
  prop,
  updateModelId,
  View,
} from '../src';

describe('Model', () => {
  it('should init a view', () => {
    const collection = new Collection();
    const view = new View('foo', collection);

    expect(view).toBeInstanceOf(View);
  });

  it('should be able to get initial models', () => {
    class Foo extends Model {
      public static type = 'foo';
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{ }, { }], Foo);
    const view = new View(Foo, collection, undefined, [-1, -2]);

    expect(view.length).toBe(2);
    expect(view.list[0]).toBeInstanceOf(Foo);
    expect(view.list[1]).toBeInstanceOf(Foo);
    expect(view.list[0]).toBe(foos[0]);
    expect(view.hasItem(foos[1])).toBe(true);
  });

  it('should be able to receive models', () => {
    class Foo extends Model {
      public static type = 'foo';
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{ }, { }], Foo);
    const view = new View(Foo, collection);

    view.add(foos);

    expect(view.length).toBe(2);
    expect(view.list[0]).toBeInstanceOf(Foo);
    expect(view.list[1]).toBeInstanceOf(Foo);
    expect(view.list[0]).toBe(foos[0]);
  });

  it('should be a dynamic list', () => {
    class Foo extends Model {
      public static type = 'foo';
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{ }, { }], Foo);
    const view = new View(Foo, collection);

    let expectedLength = 0;
    let lengthAutorunCount = 0;
    let listAutorunCount = 0;

    autorun(() => {
      expect(view.length).toBe(expectedLength);
      lengthAutorunCount++;
    });

    autorun(() => {
      expect(view.list.length).toBe(expectedLength);
      listAutorunCount++;
    });

    expectedLength = foos.length;
    view.add(foos);

    expect(view.length).toBe(2);
    expect(view.list[0]).toBeInstanceOf(Foo);
    expect(view.list[1]).toBeInstanceOf(Foo);
    expect(view.list[0]).toBe(foos[0]);
    expect(listAutorunCount).toBe(2);
    expect(lengthAutorunCount).toBe(2);
  });

  it('should be able to sort models', () => {
    class Foo extends Model {
      public static type = 'foo';

      @prop public key!: number;
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{ key: 2 }, { key: 3 }, { key: 1 }], Foo);
    const view = new View(Foo, collection, (item: Foo) => item.key, foos);

    expect(view.length).toBe(3);
    const item0a = view.list[0];
    const item2a = view.list[2];
    expect(item0a && item0a.key).toBe(1);
    expect(item2a && item2a.key).toBe(3);

    const foo0 = collection.add({ key: 0 }, Foo);
    expect(view.length).toBe(3);
    view.add(foo0);
    const item0b = view.list[0];
    const item2b = view.list[2];
    expect(item0b && item0b.key).toBe(0);
    expect(item2b && item2b.key).toBe(2);
  });

  it('should be able to update sort method', () => {
    class Foo extends Model {
      public static type = 'foo';

      @prop public key!: number;
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{ key: 2 }, { key: 3 }, { key: 1 }], Foo);
    const view = new View(Foo, collection, (item: Foo) => item.key, foos);

    expect(view.length).toBe(3);
    const item0a = view.list[0];
    const item2a = view.list[2];
    expect(item0a && item0a.key).toBe(1);
    expect(item2a && item2a.key).toBe(3);

    let keyList: Array<number|null> = [];
    let autorunCount = 0;

    autorun(() => {
      keyList = view.list.map((item) => item && item.key);
      autorunCount++;
    });

    expect(keyList[2]).toBe(3);

    runInAction(() => {
      view.sortMethod = 'id';
    });

    const item0b = view.list[0];
    const item2b = view.list[2];
    expect(item0b && item0b.key).toBe(2);
    expect(item2b && item2b.key).toBe(1);
    expect(keyList[2]).toBe(1);

    expect(autorunCount).toBe(2);
  });

  it('should be able to sort models by prop', () => {
    class Foo extends Model {
      public static type = 'foo';

      @prop public key!: number;
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{ key: 2 }, { key: 3 }, { key: 1 }], Foo);
    const view = new View(Foo, collection, 'key', foos);

    expect(view.length).toBe(3);
    const item0a = view.list[0];
    const item2a = view.list[2];
    expect(item0a && item0a.key).toBe(1);
    expect(item2a && item2a.key).toBe(3);

    const foo0 = collection.add({ key: 0 }, Foo);
    expect(view.length).toBe(3);
    view.add(foo0);
    const item0b = view.list[0];
    const item2b = view.list[2];
    expect(item0b && item0b.key).toBe(0);
    expect(item2b && item2b.key).toBe(2);
  });

  it('should be able to remove models', () => {
    class Foo extends Model {
      public static type = 'foo';
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{ }, { }, { }], Foo);
    const view = new View(Foo, collection, undefined, foos);

    expect(view.length).toBe(3);
    view.remove(foos[2]);
    expect(view.length).toBe(2);
    view.removeAll();
    expect(view.length).toBe(0);
  });

  it('should work with updating the list', () => {
    class Foo extends Model {
      public static type = 'foo';
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{ }, { }, { }], Foo);
    const view = new View(Foo, collection, undefined, foos);

    const [foo1, foo2] = collection.add([{ }, { }, { }], Foo);

    expect(view.length).toBe(3);

    view.list.push(foo1);
    expect(view.length).toBe(4);

    view.list.unshift(foo2);
    expect(view.length).toBe(5);

    view.list.splice(2, 2);
    expect(view.length).toBe(3);
  });

  it('should work with sorted list', () => {
    class Foo extends Model {
      public static type = 'foo';

      @prop.identifier public id!: number;
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{ }, { }, { }], Foo);
    const view = new View(Foo, collection, (item) => item.id, foos);

    const [foo1, foo2] = collection.add([{ }, { }, { }], Foo);

    expect(view.length).toBe(3);

    expect(() => view.list.push(foo1)).toThrowError('New models can\'t be added directly to a sorted view list');

    expect(() => view.list.unshift(foo2)).toThrowError('New models can\'t be added directly to a sorted view list');

    expect(() => view.list[1] = foo1).toThrowError('New models can\'t be added directly to a sorted view list');
    expect(() => view.list[3] = foo1).toThrowError('New models can\'t be added directly to a sorted view list');

    view.list.splice(1, 2);
    expect(view.length).toBe(1);
  });

  it('should work with unique list', () => {
    class Foo extends Model {
      public static type = 'foo';

      @prop.identifier public id!: number;
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{ }, { }, { }], Foo);
    const view = new View(Foo, collection, undefined, foos, true);

    const [foo1] = foos;

    view.list[0] = foo1;

    expect(() => view.list[1] = foo1).toThrowError('The models in this view need to be unique');

    expect(() => view.list.push(foo1)).toThrowError('The models in this view need to be unique');

    expect(() => view.list.splice(0, 0, foo1)).toThrowError('The models in this view need to be unique');
  });

  it('should be able to deserialize the view', () => {
    class Foo extends Model {
      public static type = 'foo';
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{ }, { }], Foo);
    const view = new View(Foo, collection);

    view.add(foos);

    const snapshot = view.snapshot;

    const view2 = new View(snapshot.modelType, collection, undefined, snapshot.models, snapshot.unique);

    expect(view2.length).toBe(2);
    expect(view2.list[0]).toBeInstanceOf(Foo);
    expect(view2.list[1]).toBeInstanceOf(Foo);
    expect(view2.list[0]).toBe(foos[0]);
  });

  describe('Collections', () => {
    it('should be possible to add a view', () => {
      class Foo extends Model {
        public static type = 'foo';
      }
      class AppCollection extends Collection {
        public static types = [Foo];

        public test!: View<Foo>;
      }

      const collection = new AppCollection();
      const foos = collection.add([{ }, { }], Foo);

      collection.addView('test', Foo, { models: foos });

      expect(collection.test.length).toBe(2);
      expect(collection.test.list[0]).toBeInstanceOf(Foo);
      expect(collection.test.list[1]).toBeInstanceOf(Foo);
      expect(collection.test.list[0]).toBe(foos[0]);
    });

    it('should be possible to define views upfront', () => {
      class Foo extends Model {
        public static type = 'foo';
      }
      class AppCollection extends Collection {
        public static types = [Foo];

        public static views = {
          test: { modelType: Foo },
        };

        public test!: View<Foo>;
      }

      const collection = new AppCollection();
      expect(collection.test.modelType).toBe('foo');
      const foos = collection.test.add([{ }, { }]);

      expect(collection.test.length).toBe(2);
      expect(collection.test.list[0]).toBeInstanceOf(Foo);
      expect(collection.test.list[1]).toBeInstanceOf(Foo);
      expect(collection.test.list[0]).toBe(foos[0]);

      const snapshot = collection.snapshot;

      const collection2 = new AppCollection(snapshot);
      expect(collection2.test.length).toBe(2);
    });
  });

  it('should support changing ids', () => {
    class Foo extends Model {
      public static type = 'foo';
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{ }, { }], Foo);
    const view = new View(Foo, collection, undefined, [-1, -2]);

    expect(view.length).toBe(2);
    expect(view.list[0]).toBeInstanceOf(Foo);
    expect(view.list[1]).toBeInstanceOf(Foo);
    expect(view.list[0]).toBe(foos[0]);
    expect(view.hasItem(foos[1])).toBe(true);

    const foo1 = foos[1];
    updateModelId(foo1, 123);
    expect(view.list[1]).toBe(foo1);
    expect(view.hasItem(foo1)).toBe(true);
    expect(foo1.meta.id).toBe(123);
  });
});
