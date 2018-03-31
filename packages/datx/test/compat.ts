// tslint:disable:max-classes-per-file

import {autorun, computed} from 'mobx';

import {CompatCollection, CompatModel, getModelId, getRefId, IIdentifier, prop} from '../src';
import {storage} from '../src/services/storage';

describe('Compat Model', () => {
  beforeEach(() => {
    // @ts-ignore
    storage.clear();
  });

  it('should use basic models', () => {
    class FooModel extends CompatModel {
      public static type = 'foo';

      public id!: number|string;
      public foo!: number;
      public bar!: number;
    }

    class TestCollection extends CompatCollection {
      public static types = [FooModel];

      public foo!: Array<FooModel>;
    }

    const collection = new TestCollection();
    const model = collection.add<FooModel>({
      bar: 0,
      foo: 1,
      fooBar: 0.5,
      id: 1,
    }, 'foo');

    expect(collection.length).toBe(1);
    expect(collection.foo.length).toBe(1);
    expect(collection.find<FooModel>('foo', 1)).toBe(model);
    expect(model.foo).toBe(1);
    expect(model.bar).toBe(0);
    expect(model.static.type).toBe('foo');

    const model2 = new FooModel({
      bar: 1,
    });

    expect(model2.bar).toBe(1);
    expect(model2.id).toBeUndefined();
  });

  it('should support enums for types', () => {
    enum type {
      FOO,
      BAR,
    }

    class FooModel extends CompatModel {
      public static type = type.FOO;

      public id!: number|string;
      public foo!: number;
      public bar!: number;
    }

    class TestCollection extends CompatCollection {
      public static types = [FooModel];
    }

    const collection = new TestCollection();
    const model = collection.add<FooModel>({
      bar: 0,
      foo: 1,
      fooBar: 0.5,
      id: 1,
    }, type.FOO);

    expect(collection.length).toBe(1);
    expect(collection.findAll(type.FOO).length).toBe(1);
    expect(collection.find<FooModel>(type.FOO, 1)).toBe(model);
    expect(model.foo).toBe(1);
  });

  it('should be able to upsert models', () => {
    class FooModel extends CompatModel {
      public static type = 'foo';

      @prop.identifier
      public id!: number;

      public foo!: number;
      public bar!: number;
      public fooBar!: number;
    }

    class TestCollection extends CompatCollection {
      public static types = [FooModel];

      public foo!: Array<FooModel>;
    }

    const collection = new TestCollection();
    const model = collection.add<FooModel>({
      bar: 0,
      foo: 1,
      fooBar: 0.5,
      id: 1,
    }, 'foo');

    const model2 = collection.add<FooModel>({
      bar: 1,
      foo: 2,
      fooBar: 1.5,
      id: 1,
    }, 'foo');

    expect(collection.length).toBe(1);
    expect(collection.find('foo', 1)).toBe(model);
    expect(model.foo).toBe(2);
    expect(model.bar).toBe(1);
  });

  it('should support basic relations and serializing', () => {
    class FooModel extends CompatModel {
      public static type = 'foo';
      public static refs = {bar: 'foo', fooBar: 'foo'};

      @prop.identifier
      public id!: number;

      public foo!: number;
      public bar!: FooModel;
      public fooBar!: FooModel;
    }

    class TestCollection extends CompatCollection {
      public static types = [FooModel];

      public foo!: Array<FooModel>;
    }

    const collection = new TestCollection();
    const model = collection.add<FooModel>({
      bar: 1,
      foo: 0,
      fooBar: 0.5,
      id: 1,
    }, 'foo');

    // Check if the references are ok
    expect(collection.length).toBe(1);
    expect(collection.find('foo', 1)).toBe(model);
    expect(model.foo).toBe(0);
    expect(model.bar).toBe(model);
    expect(model.fooBar).toBe(null);
    expect(model.bar.bar).toBe(model);

    // Clone the collection and check new references
    const collection2 = new TestCollection(collection.toJS());
    const model2 = collection2.find<FooModel>('foo');
    expect(collection2.length).toBe(1);
    expect(collection2.find('foo', 1)).toBe(model2);
    expect(model2).toBeInstanceOf(CompatModel);
    if (model2) {
      expect(model2.foo).toBe(0);
      expect(model2.bar).toBe(model2);
      expect(model2.fooBar).toBe(null);
      expect(model2.bar.bar).toBe(model2);
    }

    // Try to remove a non-existing model
    collection.remove('foo', 2);
    expect(collection.length).toBe(1);

    // Remove a model and check that it still exists in the cloned collection
    collection.remove('foo', 1);
    expect(collection.length).toBe(0);
    expect(collection2.length).toBe(1);

    // Try to remove all models of an unexisting type
    collection2.removeAll('foobar');
    expect(collection2.length).toBe(1);

    // Remove all models of the foo type
    collection2.removeAll('foo');
    expect(collection2.length).toBe(0);
  });

  it('should work for the readme example', () => {
    class Person extends CompatModel {
      public static type = 'person';
      public static refs = {spouse: 'person', pets: {model: 'pet', property: 'owner'}};

      public firstName!: string;
      public lastName!: string;
      public spouse!: Person;
      public pets!: Array<Pet>;

      @computed public get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
      }
    }

    class Pet extends CompatModel {
      public static type = 'pet';
      public static refs = {owner: 'person'};

      public owner!: Person;
      public ownerId!: number;
    }

    class MyCollection extends CompatCollection {
      public static types = [Person, Pet];
      public person!: Array<Person>;
      public pet!: Array<Pet>;
    }

    const collection = new MyCollection();

    const john = collection.add<Person>({
      firstName: 'John',
      id: 1,
      lastName: 'Doe',
      spouse: 2,
    }, 'person');

    const fido = collection.add<Pet>({
      id: 1,
      name: 'Fido',
      owner: john,
    }, 'pet');

    const jane = new Person({
      firstName: 'Jane',
      id: 2,
      lastName: 'Doe',
      spouse: 1,
    });
    collection.add(jane);

    expect(john.spouse.fullName).toBe('Jane Doe');
    expect(fido.owner.fullName).toBe('John Doe');
    expect(john.pets).toHaveLength(1);
    expect(fido.owner.spouse.fullName).toBe('Jane Doe');
    expect(collection.person).toHaveLength(2);
    expect(collection).toHaveLength(3);

    fido.assign('owner', {
      firstName: 'Dave',
      id: 3,
      lastName: 'Jones',
    });

    expect(fido.owner.fullName).toBe('Dave Jones');
    expect(collection.person).toHaveLength(3);
    expect(collection).toHaveLength(4);

    fido.owner = jane;
    expect(fido.owner.fullName).toBe('Jane Doe');

    expect(collection).toHaveLength(4);
    collection.reset();
    expect(collection).toHaveLength(0);
  });

  it('should support default props', () => {
    class FooModel extends CompatModel {
      public static type = 'foo';
      public static defaults = {
        foo: 4,
      };

      public foo!: number;
      public bar!: number;
    }

    class TestCollection extends CompatCollection {
      public static types = [FooModel];

      public foo!: Array<FooModel>;
    }

    const collection = new TestCollection();

    const model1 = collection.add<FooModel>({
      bar: 0,
      foo: 1,
      fooBar: 0.5,
      id: 1,
    }, 'foo');

    expect(model1.foo).toBe(1);

    const model2 = collection.add<FooModel>({
      bar: 0,
      fooBar: 0.5,
      id: 2,
    }, 'foo');

    expect(model2.foo).toBe(4);
  });

  it('should support array references', () => {
    class FooModel extends CompatModel {
      public static type = 'foo';

      public static refs = {fooBar: 'foo'};

      public id!: number;
      public foo!: number;
      public bar!: number;
      public fooBar!: FooModel|Array<FooModel>;
      public fooBarId!: number|Array<number>;
    }

    class TestCollection extends CompatCollection {
      public static types = [FooModel];

      public foo!: Array<FooModel>;
    }

    const collection = new TestCollection();

    const models = collection.add<FooModel>([{
      foo: 1,
      id: 1,
    }, {
      foo: 2,
      id: 2,
    }, {
      foo: 3,
      id: 3,
    }, {
      foo: 4,
      id: 4,
    }] as Array<object>, 'foo');

    const first = models.shift() as FooModel;
    const second = models.shift() as FooModel;
    expect(collection.length).toBe(4);

    first.fooBar = models;
    expect(collection.length).toBe(4);
    expect(first.fooBar).toHaveLength(2);
    expect(first.fooBar[1].foo).toBe(4);
    expect(JSON.stringify(getRefId(first, 'fooBar'))).toBe(JSON.stringify(models.map((model) => model.id)));

    first.fooBar.push(second);
    expect(first.fooBar).toHaveLength(3);
    expect(first.fooBar[2].foo).toBe(2);
  });

  it('should call autorun when needed', (done) => {
    class FooModel extends CompatModel {
      public static type = 'foo';

      public foo!: number;
      public bar!: number;
    }

    class TestCollection extends CompatCollection {
      public static types = [FooModel];

      public foo!: Array<FooModel>;
    }

    const collection = new TestCollection();

    const model = collection.add<FooModel>({
      bar: 3,
      foo: 1,
      id: 1,
    }, 'foo');

    let runs = 0;
    const expected = [1, 3, 5];
    autorun(() => {
      expect(model.foo).toBe(expected[runs]);
      runs++;

      if (runs === 3) {
        done();
      }
    });

    model.foo = 3;
    model.bar = 123;
    model.foo = 5;
  });

  it('should support dynamic references', () => {
    class FooModel extends CompatModel {
      public static type = 'foo';

      public foo!: number;
    }

    class TestCollection extends CompatCollection {
      public static types = [FooModel];

      public foo!: Array<FooModel>;
    }

    const collection = new TestCollection();

    const models = collection.add<FooModel>([{
      foo: 1,
      id: 1,
    }, {
      foo: 2,
      id: 2,
    }, {
      foo: 3,
      id: 3,
    }, {
      foo: 4,
      id: 4,
    }], 'foo');

    const first = models.shift() as FooModel;

    first.assignRef('bar', models, 'foo');
    expect(first['bar']).toHaveLength(3);
    expect(first['bar'][1].foo).toBe(3);
  });

  it('should support generic references', () => {
    const collection = new CompatCollection();

    const models = collection.add<CompatModel>([{
      foo: 1,
      id: 1,
    }, {
      foo: 2,
      id: 2,
    }, {
      foo: 3,
      id: 3,
    }, {
      foo: 4,
      id: 4,
    }], CompatModel);

    const first = models.shift() as CompatModel;

    first.assignRef('bar', models);
    expect(first['bar']).toHaveLength(3);
    expect(first['bar'][1].foo).toBe(3);
  });

  it('should work with autoincrement', () => {
    class Foo extends CompatModel {
      public static type = 'foo';

      @prop.identifier
      public myID!: number;
    }

    class Bar extends CompatModel {
      public static type = 'bar';
      public static enableAutoId = false;
      public id!: number;
    }

    class Baz extends CompatModel {
      public static type = 'baz';
      public static autoIdFunction() {
        return Math.random();
      }
      public id!: number;
    }

    class TestCollection extends CompatCollection {
      public static types = [Foo, Bar, Baz];
      public foo!: Array<Foo>;
    }

    const collection = new TestCollection();

    const foo1 = collection.add<Foo>({bar: 1}, 'foo');
    const foo2 = collection.add<Foo>({bar: 1}, 'foo');
    const foo10 = collection.add<Foo>({myID: 10, bar: 1}, 'foo');
    const foo3 = collection.add<Foo>({bar: 1}, 'foo');
    const foo4 = collection.add<Foo>({myID: -4, bar: 1}, 'foo');
    const foo5 = collection.add<Foo>({bar: 1}, 'foo');

    expect(foo1.myID).toBe(-1);
    expect(foo5.myID).toBe(-5);
    expect(foo4.myID).toBe(-4);
    expect(foo10.myID).toBe(10);
    expect(collection.foo.length).toBe(6);

    const bar5 = collection.add<Bar>({id: 5}, 'bar');
    expect(bar5.getRecordId()).toBe(5);
    expect(() => collection.add<Bar>({foo: 1}, 'bar')).toThrow('Model id is required (autoincrement is disabled)');

    const baz1 = collection.add<Baz>({}, 'baz');
    expect(baz1.getRecordId()).toBe(-1);
  });

  it('should support typeAttribute', () => {
    class TestModel extends CompatModel {
      @prop.type
      public foo!: string;
    }

    class TestCollection extends CompatCollection {
      public static types = [TestModel];
    }

    const collection = new TestCollection();

    const model = new TestModel({id: 1, foo: 'bar'});
    collection.add(model);

    const bar = collection.findAll('bar');
    expect(bar.length).toBe(1);

    const baz = collection.findAll('baz');
    expect(baz.length).toBe(0);
  });

  it('should handle null references', () => {
    class Foo extends CompatModel {
      public static type = 'foo';
    }

    class TestCollection extends CompatCollection {
      public static types = [Foo];
    }

    const collection = new TestCollection();
    const model = collection.add<Foo>({}, 'foo');
    model.assign('foo', 1);
    model.assignRef('self', model, 'foo');
    model.assignRef('self2', model);
    expect(() => model.assignRef('empty', null)).toThrow('The type property is missing');

    expect(model['self']).toBe(model);
    expect(model['self2']).toBe(model);
  });

  it('should support references during collection add', () => {
    class Foo extends CompatModel {
      public static type = 'foo';

      public static refs = {bar: 'bar'};

      public foo!: number;
      public bar!: Bar|Array<Bar>;
    }

    class Bar extends CompatModel {
      public static type = 'bar';
      public bar!: number;
    }

    class TestCollection extends CompatCollection {
      public static types = [Foo, Bar];
      public foo!: Array<Foo>;
      public bar!: Array<Bar>;
    }

    const collection = new TestCollection();

    const foo = collection.add<Foo>({
      bar: {
        bar: 3,
        id: 4,
      },
      foo: 2,
      id: 1,
    }, 'foo');

    expect(foo.foo).toBe(2);
    expect(foo.bar['bar']).toBe(3);
    expect(collection.foo).toHaveLength(1);
    expect(collection.bar).toHaveLength(1);

    const foo2 = collection.add<Foo>({
      bar: [{
        bar: 8,
        id: 7,
      }, {
        bar: 10,
        id: 9,
      }],
      foo: 6,
      id: 5,
    }, 'foo');

    expect(foo2.bar[0].bar).toBe(8);
    expect(foo2.bar[1].bar).toBe(10);
    expect(collection.foo).toHaveLength(2);
    expect(collection.bar).toHaveLength(3);
  });

  it('should work for a real world scenario', () => {
    class User extends CompatModel {
      public static type = 'user';
      public email!: string;
    }

    class Cart extends CompatModel {
      public static type = 'cart';
      public static refs = {user: 'user', products: 'cartItem'};
      public user!: User|Array<User>;
      public products!: CartItem|Array<CartItem>;
      public id!: number;
    }

    class CartItem extends CompatModel {
      public static type = 'cartItem';
      public static refs = {product: 'products'};
      public product!: Product|Array<Product>;
      public quantity!: number;
      public id!: number;
    }

    class Product extends CompatModel {
      public static type = 'products';
      public name!: string;
      public price!: number;
    }

    class TestCollection extends CompatCollection {
      public static types = [User, Cart, CartItem, Product];
      public user!: Array<User>;
      public cart!: Array<Cart>;
      public cartItem!: Array<CartItem>;
      public products!: Array<Product>;
    }

    const collection = new TestCollection();

    const cart = collection.add<Cart>({
      id: 1,
      products: [{
        product: {
          id: 1,
          name: 'Electrons',
          price: 9.99,
        },
        quantity: 8,
      }, {
        product: {
          id: 2,
          name: 'Protons',
          price: 5.99,
        },
        quantity: 2,
      }],
      user: {
        email: 'test@example.com',
        id: 1,
        role: 1,
        token: 'dc9dcd8116673372e96cc0410821da6a',
        username: 'jdoe42',
      },
    }, 'cart');

    expect(collection.user).toHaveLength(1);
    expect(collection.cart).toHaveLength(1);
    expect(collection.cartItem).toHaveLength(2);
    expect(collection.products).toHaveLength(2);
    expect(cart.user['email']).toBe('test@example.com');
    expect(cart.products).toHaveLength(2);
    expect(cart.products[0].quantity).toBe(8);
    expect(cart.products[1].quantity).toBe(2);
    expect(cart.products[0].product.name).toBe('Electrons');
  });

  it('should work with preprocess', () => {
    class Foo extends CompatModel {
      public static type = 'foo';
      public static refs = {bar: 'bar'};
      public static preprocess(rawData) {
        return Object.assign({newProp: 1}, rawData);
      }
      public bar!: Bar|Array<Bar>;
    }

    class Bar extends CompatModel {
      public static type = 'bar';
      public static preprocess(rawData) {
        return Object.assign({barProp: 2}, rawData);
      }
    }

    class TestCollection extends CompatCollection {
      public static types = [Foo, Bar];
    }

    const collection = new TestCollection();

    const foo = collection.add<Foo>({
      bar: [{
        bar: 8,
        id: 7,
      }, {
        bar: 10,
        id: 9,
      }],
      foo: 6,
      id: 5,
    }, 'foo');

    expect(foo['newProp']).toBe(1);
    expect(foo.bar[0]['barProp']).toBe(2);
    expect(foo.bar[1]['barProp']).toBe(2);
  });

  it('should update an exiting reference', () => {
    class Foo extends CompatModel {
      public static type = 'foo';
      public static refs = {self: 'foo'};

      public self!: Foo|Array<Foo>;
      public id!: number;
      public foo!: number;
    }

    class TestCollection extends CompatCollection {
      public static types = [Foo];
    }

    const collection = new TestCollection();

    const model = collection.add<Foo>({id: 1, foo: 2, self: 1}, 'foo');

    expect(model.self).toBe(model);

    model.assignRef('self', model);

    expect(model.self).toBe(model);
  });

  it('should not update a reserved key', () => {
    class Foo extends CompatModel {
      public static type = 'foo';

      @prop.identifier
      public id!: number;
      public foo!: number;
    }

    class TestCollection extends CompatCollection {
      public static types = [Foo];
    }

    const collection = new TestCollection();
    const model = collection.add<Foo>({id: 1, foo: 2}, 'foo');

    expect(model.assign).toBeInstanceOf(Function);
    expect(model.id).toBe(1);
    model.update({id: 2, assign: true, foo: 3} as object);
    expect(model.assign).toBeInstanceOf(Function);
    expect(model.id).toBe(1);
    expect(model.foo).toBe(3);
  });

  it('should suport updating the array items in the reference', () => {
    class Foo extends CompatModel {
      public static type = 'foo';
      public static refs = {bar: 'foo'};
      public id!: number;
      public foo!: number;
      public bar!: Foo|Array<Foo>;
    }

    class TestCollection extends CompatCollection {
      public static types = [Foo];
    }

    const collection = new TestCollection();
    const model1 = collection.add<Foo>({id: 1, foo: 2, bar: [1]}, 'foo');
    const model2 = collection.add<Foo>({id: 2, foo: 4, bar: [1, 1, 2]}, 'foo');

    expect(model2.bar[0]).toBe(model1);
    expect(model2.bar).toHaveLength(3);

    model2.bar[0] = model2;
    expect(model2.bar[0]).toBe(model2);
    expect(model2.bar).toHaveLength(3);
  });

  it('should validate the reference types', () => {
    class Foo extends CompatModel {
      public static type = 'foo';
      public static refs = {foo: 'foo'};
      public foo: any; // This would usually be Foo|Array<Foo>, but we need to test the other cases
    }

    class Bar extends CompatModel {
      public static type = 'bar';
    }

    class TestCollection extends CompatCollection {
      public static types = [Foo, Bar];
    }

    const collection = new TestCollection();
    const foo = collection.add<Foo>({id: 1, foo: 1}, 'foo');
    const bar = collection.add<Bar>({id: 2, bar: 3}, 'bar');

    expect(foo.foo).toBe(foo);

    expect(() => {
      foo.foo = bar;
    }).toThrow('The new reference type doesn\'t match to the declared one.');

    expect(foo.foo).toBe(foo);
  });

  describe('relationships', () => {
    it('should support many to one/many relationships', () => {
      class Foo extends CompatModel {
        public static type = 'foo';
        public static refs = {bars: {model: 'bar', property: 'fooBar'}};

        public bars!: Bar|Array<Bar>;
      }

      class Bar extends CompatModel {
        public static type = 'bar';
        public static refs = {fooBar: 'foo'};

        public fooBar!: Foo|Array<Foo>;
      }

      class TestStore extends CompatCollection {
        public static types = [Foo, Bar];
      }

      const store = new TestStore();

      const foo = store.add<Foo>({id: 1, type: 'foo'}, 'foo');
      const bars = store.add<Bar>([{
        fooBar: 1,
        id: 2,
        type: 'bar',
      }, {
        fooBar: 2,
        id: 3,
        type: 'bar',
      }, {
        fooBar: 1,
        id: 4,
        type: 'bar',
      }], 'bar');

      expect(bars).toHaveLength(3);
      expect(foo.bars).toHaveLength(2);
      expect(foo.bars[0].id).toBe(2);
      expect(foo.bars[1].id).toBe(4);
    });

    it('should support relationships to itself', () => {
      class Person extends CompatModel {
        public static type = 'person';
        public static refs = {
          children: {
            model: 'person',
            property: 'parents',
          },
          parents: 'person',
          spouse: 'person',
        };

        public firstName!: string;
        public spouse!: Person;
        public children!: Array<Person>;
        public parents!: Person|Array<Person>;
      }

      class Store extends CompatCollection {}
      Store.types = [Person];

      const collection = new Store();
      const steve = collection.add({firstName: 'Steve'}, 'person') as Person;
      const jane = collection.add({firstName: 'Jane'}, 'person') as Person;
      const bob = collection.add({firstName: 'Bob'}, 'person') as Person;
      const john = collection.add({firstName: 'John'}, 'person') as Person;

      steve.spouse = jane;

      bob.parents = [steve, jane];
      john.parents = steve;

      expect(steve.children).toHaveLength(2);
      expect(jane.children).toHaveLength(1);
    });
  });

  describe('snapshots', () => {
    it('should support snapshots', () => {
      class FooModel extends CompatModel {
        public static type = 'foo';

        public id!: number|string;
        public foo!: number;
        public bar!: number;
      }

      class TestCollection extends CompatCollection {
        public static types = [FooModel];

        public foo!: Array<FooModel>;
      }

      const collection = new TestCollection();
      const model = collection.add<FooModel>({
        bar: 0,
        foo: 1,
        fooBar: 0.5,
        id: 1,
      }, 'foo');

      const raw = model.snapshot;
      expect(raw.__META__ && raw.__META__.type).toBe('foo');

      model.foo++;

      expect(raw.__META__ && raw.__META__.type).toBe('foo');

      const raw2 = model.snapshot;
      expect(raw2.__META__ && raw2.__META__.type).toBe('foo');

      const rawCollection = collection.snapshot.models;
      const raw3 = rawCollection[0];
      expect(raw3.__META__ && raw3.__META__.type).toBe('foo');
    });
  });

  describe('insert', () => {
    it('should insert a single item', () => {
      class FooModel extends CompatModel {
        public static type = 'foo';

        public id!: number|string;
      }

      class TestCollection extends CompatCollection {
        public static types = [FooModel];

        public foo!: Array<FooModel>;
      }

      const model = new FooModel({id: 123});
      const raw = model.toJS();

      const store = new TestCollection();
      const inserted = store.insert([raw]) as Array<FooModel>;
      expect(inserted[0].id).toBe(123);
    });

    it('should insert multiple items', () => {
      class FooModel extends CompatModel {
        public static type = 'foo';

        public id!: number|string;
      }

      class TestCollection extends CompatCollection {
        public static types = [FooModel];

        public foo!: Array<FooModel>;
      }

      const model1 = new FooModel({id: 123});
      const model2 = new FooModel({id: 456});
      const raw = [model1.toJS(), model2.toJS()];

      const store = new TestCollection();
      const inserted = store.insert(raw) as Array<FooModel>;
      expect(inserted[0].id).toBe(123);
      expect(inserted[1].id).toBe(456);
    });

    it('should throw if the data is invalid for a single object', () => {
      const store = new CompatCollection();

      expect(() => store.insert([{id: 123}]))
        .toThrow('The type needs to be defined if the object is not an instance of the model.');
    });

    it('should throw if the data is invalid for multiple objects', () => {
      const store = new CompatCollection();

      expect(() => store.insert([{id: 123}, {id: 345}]))
        .toThrow('The type needs to be defined if the object is not an instance of the model.');
    });

    it('should throw and not insert anything if any input is invalid', () => {
      class FooModel extends CompatModel {
        public static type = 'foo';

        public id!: number|string;
      }

      class TestCollection extends CompatCollection {
        public static types = [FooModel];

        public foo!: Array<FooModel>;
      }

      const model = new FooModel({id: 123});
      const raw = model.toJS();

      const store = new TestCollection();
      expect(() => store.insert([raw, {id: 456}]))
        .toThrow('The type needs to be defined if the object is not an instance of the model.');
      expect(store.length).toBe(0);
    });
  });

  describe('editing reference arrays', () => {
    it('should be possible to push to a ref array', () => {
      class Foo extends CompatModel {
        public static type = 'foo';
        public static refs = {bar: 'bar'};
        public id!: number;
        public bar!: Array<Bar>;
      }

      class Bar extends CompatModel {
        public static type = 'bar';

        @prop.identifier
        public id!: number;
      }

      class Store extends CompatCollection {
        public static types = [Foo, Bar];
      }

      const store = new Store();

      const foo = store.add<Foo>({id: 1, bar: [{id: 1}, {id: 2}]}, 'foo');

      expect(foo.bar).toHaveLength(2);

      const bar3 = store.add<Bar>({id: 3}, 'bar');

      foo.bar.push(bar3);

      expect(foo.bar).toHaveLength(3);
      expect(getRefId(foo, 'bar')).toHaveLength(3);
      expect(getRefId(foo, 'bar')[2]).toBe(3);
      expect(foo.bar[2].id).toBe(3);

      const bar4 = store.add<Bar>({id: 4}, 'bar');

      const fooBar = getRefId(foo, 'bar') as Array<IIdentifier>;
      fooBar.push(4);

      expect(foo.bar).toHaveLength(4);
      expect(getRefId(foo, 'bar')).toHaveLength(4);
      expect(foo.bar[3]).toBe(bar4);

      foo.bar['remove'](bar4);

      expect(foo.bar).toHaveLength(3);
      expect(getRefId(foo, 'bar')).toHaveLength(3);
      expect(getRefId(foo, 'bar')[2]).toBe(3);

      const fooBar2 = getRefId(foo, 'bar') as Array<IIdentifier>;
      fooBar2['remove'](3);

      expect(foo.bar).toHaveLength(2);

      foo.bar.push({} as Bar);

      expect(foo.bar).toHaveLength(3);
      expect(getRefId(foo, 'bar')).toHaveLength(3);
      expect(foo.bar[2].id).toBe(-1);
      expect(getRefId(foo, 'bar')[2]).toBe(-1);
    });
  });
});
