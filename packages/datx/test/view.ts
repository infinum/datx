import { autorun, configure, runInAction } from 'mobx';

import { Collection, Model, View, Attribute } from '../src';
import { updateModelId } from '../src/helpers/model/fields';
import { ViewAttribute } from '../src/Attribute';

configure({ enforceActions: 'observed' });

describe('View', () => {
  it('should init a view', () => {
    const collection = new Collection();
    const viewInstance = new View('foo', collection);

    expect(viewInstance).toBeInstanceOf(View);
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
    const viewInstance = new View(Foo, collection, undefined, [-1, -2]);

    expect(viewInstance).toHaveLength(2);
    expect(viewInstance.list[0]).toBeInstanceOf(Foo);
    expect(viewInstance.list[1]).toBeInstanceOf(Foo);
    expect(viewInstance.list[0]).toBe(foos[0]);
    expect(viewInstance.hasItem(foos[1])).toBe(true);
  });

  it('should be able to receive models', () => {
    class Foo extends Model {
      public static type = 'foo';
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{}, {}], Foo);
    const viewInstance = new View(Foo, collection);

    viewInstance.add(foos);

    expect(viewInstance).toHaveLength(2);
    expect(viewInstance.list[0]).toBeInstanceOf(Foo);
    expect(viewInstance.list[1]).toBeInstanceOf(Foo);
    expect(viewInstance.list[0]).toBe(foos[0]);
  });

  it('should be a dynamic list', () => {
    class Foo extends Model {
      public static type = 'foo';
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{}, {}], Foo);
    const viewInstance = new View(Foo, collection);

    let expectedLength = 0;
    let lengthAutorunCount = 0;
    let listAutorunCount = 0;

    autorun(() => {
      expect(viewInstance).toHaveLength(expectedLength);
      lengthAutorunCount++;
    });

    autorun(() => {
      expect(viewInstance.list).toHaveLength(expectedLength);
      listAutorunCount++;
    });

    expectedLength = foos.length;
    viewInstance.add(foos);

    expect(viewInstance).toHaveLength(2);
    expect(viewInstance.list[0]).toBeInstanceOf(Foo);
    expect(viewInstance.list[1]).toBeInstanceOf(Foo);
    expect(viewInstance.list[0]).toBe(foos[0]);
    expect(listAutorunCount).toBe(2);
    expect(lengthAutorunCount).toBe(2);
  });

  it('should be able to sort models', () => {
    class Foo extends Model {
      public static type = 'foo';

      @Attribute()
      public key!: number;
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{ key: 2 }, { key: 3 }, { key: 1 }], Foo);
    const viewInstance = new View(Foo, collection, (item: Foo) => item.key, foos);

    expect(viewInstance).toHaveLength(3);
    const item0a = viewInstance.list[0];
    const item2a = viewInstance.list[2];

    expect(item0a && item0a.key).toBe(1);
    expect(item2a && item2a.key).toBe(3);

    const foo0 = collection.add({ key: 0 }, Foo);

    expect(viewInstance).toHaveLength(3);
    viewInstance.add(foo0);
    const item0b = viewInstance.list[0];
    const item2b = viewInstance.list[2];

    expect(item0b && item0b.key).toBe(0);
    expect(item2b && item2b.key).toBe(2);
  });

  it('should be able to sort models by non-numerical prop', () => {
    class Foo extends Model {
      public static type = 'foo';

      @Attribute()
      public key!: string;
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{ key: 'abd' }, { key: 'bbf' }, { key: 'ecf' }], Foo);
    const viewInstance = new View(Foo, collection, (item: Foo) => item.key, foos);

    expect(viewInstance).toHaveLength(3);
    const item0a = viewInstance.list[0];
    const item2a = viewInstance.list[2];

    expect(item0a && item0a.key).toBe('abd');
    expect(item2a && item2a.key).toBe('ecf');

    const foo0 = collection.add({ key: 'ccc' }, Foo);

    expect(viewInstance).toHaveLength(3);
    viewInstance.add(foo0);
    const item0b = viewInstance.list[0];
    const item2b = viewInstance.list[2];

    expect(item0b && item0b.key).toBe('abd');
    expect(item2b && item2b.key).toBe('ccc');
  });

  it('should be able to update sort method', () => {
    class Foo extends Model {
      public static type = 'foo';

      @Attribute()
      public key!: number;
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{ key: 2 }, { key: 3 }, { key: 1 }], Foo);
    const viewInstance = new View(Foo, collection, (item: Foo) => item.key, foos);

    expect(viewInstance).toHaveLength(3);
    const item0a = viewInstance.list[0];
    const item2a = viewInstance.list[2];

    expect(item0a && item0a.key).toBe(1);
    expect(item2a && item2a.key).toBe(3);

    let keyList: Array<number | null> = [];
    let autorunCount = 0;

    autorun(() => {
      keyList = viewInstance.list.map((item) => item && item.key);
      autorunCount++;
    });

    expect(keyList[2]).toBe(3);

    runInAction(() => {
      viewInstance.sortMethod = 'id';
    });

    const item0b = viewInstance.list[0];
    const item2b = viewInstance.list[2];

    expect(item0b && item0b.key).toBe(2);
    expect(item2b && item2b.key).toBe(1);
    expect(keyList[2]).toBe(1);

    expect(autorunCount).toBe(2);
  });

  it('should be able to sort models by prop', () => {
    class Foo extends Model {
      public static type = 'foo';

      @Attribute()
      public key!: number;
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{ key: 2 }, { key: 3 }, { key: 1 }], Foo);
    const viewInstance = new View(Foo, collection, 'key', foos);

    expect(viewInstance).toHaveLength(3);
    const item0a = viewInstance.list[0];
    const item2a = viewInstance.list[2];

    expect(item0a && item0a.key).toBe(1);
    expect(item2a && item2a.key).toBe(3);

    const foo0 = collection.add({ key: 0 }, Foo);

    expect(viewInstance).toHaveLength(3);
    viewInstance.add(foo0);
    const item0b = viewInstance.list[0];
    const item2b = viewInstance.list[2];

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
    const foos = collection.add([{}, {}, {}], Foo);
    const viewInstance = new View(Foo, collection, undefined, foos);

    expect(viewInstance).toHaveLength(3);
    viewInstance.remove(foos[2]);
    expect(viewInstance).toHaveLength(2);
    viewInstance.removeAll();
    expect(viewInstance).toHaveLength(0);
  });

  it('should work with updating the list', () => {
    class Foo extends Model {
      public static type = 'foo';
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{}, {}, {}], Foo);
    const viewInstance = new View(Foo, collection, undefined, foos);

    const [foo1, foo2] = collection.add([{}, {}, {}], Foo);

    expect(viewInstance).toHaveLength(3);

    viewInstance.list.push(foo1);
    expect(viewInstance).toHaveLength(4);

    viewInstance.list.unshift(foo2);
    expect(viewInstance).toHaveLength(5);

    viewInstance.list.splice(2, 2);
    expect(viewInstance).toHaveLength(3);
  });

  it('should work with sorted list', () => {
    class Foo extends Model {
      public static type = 'foo';

      @Attribute({ isIdentifier: true })
      public id!: number;
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{}, {}, {}], Foo);
    const viewInstance = new View(Foo, collection, (item) => item.id, foos);

    const [foo1, foo2] = collection.add([{}, {}, {}], Foo);

    expect(viewInstance).toHaveLength(3);

    expect(() => viewInstance.list.push(foo1)).toThrowError(
      "New models can't be added directly to a sorted view list",
    );

    expect(() => viewInstance.list.unshift(foo2)).toThrowError(
      "New models can't be added directly to a sorted view list",
    );

    expect(() => {
      viewInstance.list[1] = foo1;
    }).toThrowError("New models can't be added directly to a sorted view list");
    expect(() => {
      viewInstance.list[3] = foo1;
    }).toThrowError("New models can't be added directly to a sorted view list");

    viewInstance.list.splice(1, 2);
    expect(viewInstance).toHaveLength(1);
  });

  it('should work with unique list', () => {
    class Foo extends Model {
      public static type = 'foo';

      @Attribute({ isIdentifier: true })
      public id!: number;
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{}, {}, {}], Foo);
    const viewInstance = new View(Foo, collection, undefined, foos, true);

    const [foo1] = foos;

    viewInstance.list[0] = foo1;

    expect(() => {
      viewInstance.list[1] = foo1;
    }).toThrowError('The models in this view need to be unique');

    expect(() => viewInstance.list.push(foo1)).toThrowError(
      'The models in this view need to be unique',
    );

    expect(() => viewInstance.list.splice(0, 0, foo1)).toThrowError(
      'The models in this view need to be unique',
    );
  });

  it('should be able to deserialize the view', () => {
    class Foo extends Model {
      public static type = 'foo';
    }
    class AppCollection extends Collection {
      public static types = [Foo];
    }

    const collection = new AppCollection();
    const foos = collection.add([{}, {}], Foo);
    const viewInstance = new View(Foo, collection);

    viewInstance.add(foos);

    const { snapshot } = viewInstance;

    const view2 = new View(
      snapshot.modelType,
      collection,
      undefined,
      snapshot.models,
      snapshot.unique,
    );

    expect(view2).toHaveLength(2);
    expect(view2.value[0]).toBeInstanceOf(Foo);
    expect(view2.value[1]).toBeInstanceOf(Foo);
    expect(view2.value[0]).toBe(foos[0]);
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
      const foos = collection.add([{}, {}], Foo);

      collection.addView('test', Foo, { models: foos });

      expect(collection.test).toHaveLength(2);
      expect(collection.test.value[0]).toBeInstanceOf(Foo);
      expect(collection.test.value[1]).toBeInstanceOf(Foo);
      expect(collection.test.value[0]).toBe(foos[0]);
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
      const foos = collection.test.add([{}, {}]);

      expect(collection.test).toHaveLength(2);
      expect(collection.test.value[0]).toBeInstanceOf(Foo);
      expect(collection.test.value[1]).toBeInstanceOf(Foo);
      expect(collection.test.value[0]).toBe(foos[0]);

      const { snapshot } = collection;

      const collection2 = new AppCollection(snapshot);

      expect(collection2.test).toHaveLength(2);
    });

    it('should be possible to define views upfront with a decorator', () => {
      class Foo extends Model {
        public static type = 'foo';
      }
      class AppCollection extends Collection {
        public static types = [Foo];

        @ViewAttribute(Foo)
        public test!: View<Foo>;
      }

      const collection = new AppCollection();

      expect(collection.test.modelType).toBe('foo');
      const foos = collection.test.add([{}, {}]);

      expect(collection.test).toHaveLength(2);
      expect(collection.test.value[0]).toBeInstanceOf(Foo);
      expect(collection.test.value[1]).toBeInstanceOf(Foo);
      expect(collection.test.value[0]).toBe(foos[0]);

      const { snapshot } = collection;

      const collection2 = new AppCollection(snapshot);

      expect(collection2.test).toHaveLength(2);
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
    const foos = collection.add([{}, {}], Foo);
    const viewInstance = new View(
      Foo,
      collection,
      undefined,
      foos.map((foo) => foo.meta.id),
    );

    expect(viewInstance).toHaveLength(2);
    expect(viewInstance.list[0]).toBeInstanceOf(Foo);
    expect(viewInstance.list[1]).toBeInstanceOf(Foo);
    expect(viewInstance.list[0]).toBe(foos[0]);
    expect(viewInstance.hasItem(foos[1])).toBe(true);

    const foo1 = foos[1];

    updateModelId(foo1, 123);
    expect(viewInstance.list[1]).toBe(foo1);
    expect(viewInstance.hasItem(foo1)).toBe(true);
    expect(foo1.meta.id).toBe(123);
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
    const viewInstance = new View(Foo, collection, undefined, [987, 123, 234]);
    // const foos = collection.add([{ id: 123 }, { id: 234 }], Foo);

    const lengths: Array<number> = [];

    autorun(() => {
      lengths.push(viewInstance.length);
    });

    runInAction(() => {
      // @ts-expect-error
      viewInstance.list.push(876);
    });

    // expect(collection).toHaveLength(2);
    // expect(viewInstance).toHaveLength(2);
    // expect(viewInstance.snapshot.models).toHaveLength(4);
    // expect(viewInstance.list[0]).toBeInstanceOf(Foo);
    // expect(viewInstance.list[1]).toBeInstanceOf(Foo);
    // expect(viewInstance.list[0]).toBe(foos[0]);
    // expect(viewInstance.hasItem(foos[1])).toBe(true);

    // const foo987 = collection.add({ id: 987 }, Foo);
    // expect(collection).toHaveLength(3);
    // expect(viewInstance).toHaveLength(3);
    // expect(viewInstance.hasItem(foo987)).toBe(true);

    // // viewInstance.add({ id: 876 });
    // const foo876 = collection.add({ id: 876 }, Foo);
    // collection.add({ id: 765 }, Foo);
    // expect(collection).toHaveLength(5);
    // expect(viewInstance).toHaveLength(4);
    // expect(viewInstance.hasItem(foo876)).toBe(true);
  });
});
