---
id: version-2.0.0-test-data-factory
title: Test data factory
original_id: test-data-factory
---

Rather than instancing random models each time you want to test something in your system you can instead use a _factory_ that can create fake data. This keeps your tests consistent and means that they always use data that replicates the real thing. If your tests work off objects close to the real thing they are more useful and there's a higher chance of them finding bugs.

```sh
npm install --save-dev @datx/test-data-factory
yarn add --dev @datx/test-data-factory
```

## Creating your first factory

We use the `createFactory` function to create a factory. You give a factory an object of fields you want to define:

```js
import { createFactory } from '@datx/test-data-factory';
import { createClient } from './create-client';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

const userFactory = factory(User, {
  fields: {
    name: 'John',
  },
});

const user = userFactory();

console.log(user); // => { name: 'John'}
```

Once you've created a factory, you can call it to generate an instance of that object - in this case, a `user`.

It would be boring though if each user had the same `name` - so `@datx/test-data-factory` lets you generate data via some API methods:

### Incrementing IDs with `sequence`

Often you will be creating objects that have an ID that comes from a database, so you need to guarantee that it's unique. You can use `sequence`, which increments every time it's called:

```js
import { createFactory, sequence } from '@datx/test-data-factory';
import { createClient } from './create-client';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

const userFactory = factory(User, {
  fields: {
    id: sequence(),
  },
});
const userOne = userFactory();
const userTwo = userFactory();
// userOne.id === 1
// userTwo.id === 2
```

If you need more control, you can pass `sequence` a function that will be called with the number. This is useful to ensure completely unique emails, for example:

```js
import { createFactory, sequence } from '@datx/test-data-factory';
import { createClient } from './create-client';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

const userFactory = factory(User, {
  fields: {
    email: sequence((x) => `example${x}@gmail.com`),
  },
});
const userOne = userFactory();
const userTwo = userFactory();
// userOne.email === example1@gmail.com
// userTwo.email === example2@gmail.com
```

You can use the `reset` method to reset the counter used internally when generating a sequence:

```js
import { createFactory, sequence } from '@datx/test-data-factory';
import { createClient } from './create-client';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

const userFactory = factory(User, {
  fields: {
    id: sequence(),
  },
});

const userOne = userFactory();
const userTwo = userFactory();

userFactory.reset();

const userThree = userFactory();
const userFour = userFactory();
// userOne.id === 1
// userTwo.id === 2
// userThree.id === 1 <- the sequence has been reset here
// userFour.id === 2
```

### Randomly picking between an option

If you want an object to have a random value, picked from a list you control, you can use `oneOf`:

```js
import { createFactory, sequence, oneOf } from '@datx/test-data-factory';
import { createClient } from './create-client';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

const userFactory = factory(User, {
  fields: {
    name: oneOf('alice', 'bob', 'charlie'),
  },
});
```

### `bool`

If you need something to be either `true` or `false`, you can use `bool`:

```js
import { createFactory, sequence, bool } from '@datx/test-data-factory';
import { createClient } from './create-client';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

const userFactory = factory(User, {
  fields: {
    isAdmin: bool(),
  },
});
```

### `perBuild`

`@datx/test-data-factory` lets you declare a field to always be a particular value:

```js
import { createFactory, sequence } from '@datx/test-data-factory';
import { createClient } from './create-client';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

const userFactory = factory(User, {
  fields: {
    name: 'John',
    email: `user-${Math.random()}@example.com`,
  },
});
```

A user generated from this factory will always be the same data. However, if you generate two users using the factory above, they will have _exactly the same value_ for the `email` field:

```js
const userOne = userFactory();
const userTwo = userFactory();
userOne.email === userTwo.email; // true
```

If you want to generate a unique object every time, you can use `perBuild` which takes a function and executes it when a factory is built:

```js
import { createFactory, sequence, perBuild } from '@datx/test-data-factory';
import { createClient } from './create-client';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

const userFactory = factory(User, {
  fields: {
    name: 'John',
    email: perBuild(() => `user-${Math.random()}@example.com`),
  },
});
const userOne = userFactory();
const userTwo = userFactory();
userOne.details === userTwo.details; // false
```

This approach also lets you use any additional libraries, say if you wanted to use a library to generate fake data:

```js
const myFakeLibrary = require('whatever-library-you-want');
import { createFactory, sequence, perBuild } from '@datx/test-data-factory';
import { createClient } from './create-client';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

const userFactory = factory(User, {
  fields: {
    name: perBuild(() => myFakeLibrary.randomName()),
  },
});
```

### Mapping over all the created objects with `postBuild`

If you need to transform an object in a way that `@datx/test-data-factory` doesn't support out the box, you can pass a `postBuild` function when creating a factory. This factory will run every time you create an object from it.

```js
import { createFactory, sequence, perBuild } from '@datx/test-data-factory';
import { createClient } from './create-client';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

const userFactory = factory(User, {
  fields: {
    name: perBuild(() => 'John'),
  },
  postBuild: (user) => {
    user.name = user.name.toUpperCase();

    return user;
  },
});
const user = userFactory();
// user.name will be uppercase
```

> `postBuild` will be executed after `overrides` transformations!

## Build many helper `buildMany`

`@datx/test-data-factory` provides a helper function `buildMany` that lets you create many objects at once:

```ts
import { createFactory, sequence, perBuild, buildMany } from '@datx/test-data-factory';
import { createClient } from './create-client';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

const userFactory = factory(User, {
  fields: {
    id: sequence(),
    name: sequence((n) => `John Doe ${n}`),
    email: sequence((n) => `john${n}@example.com`),
    createdAt: new Date('2020-01-01'),
  },
});

const users = buildMany(userFactory, 5);

// users will be an array of 5 users
```

## Working with deeply nested relationships

`@datx/test-data-factory` lets you create deeply nested relationships between objects.

For example, if you have a `Post` model that has many `Comment` models, and each `Comment` has
an `author` relationship to a `User` model, you can create a `Post` with a bunch of `Comment`s,
each with an `author`.

```ts
import { createFactory, sequence, perBuild, buildMany } from '@datx/test-data-factory';
import { createClient } from './create-client';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

const userFactory = factory(User, {
  fields: {
    id: sequence(),
    name: sequence((n) => `John Doe ${n}`),
    email: sequence((n) => `john${n}@example.com`),
    createdAt: new Date('2020-01-01'),
  },
});

const commentFactory = factory(Comment, {
  fields: {
    id: sequence(),
    body: 'Hello world',
    author: perBuild(() => userFactory()),
  },
});

const postFactory = factory(Post, {
  fields: {
    id: sequence(),
    title: 'My first post',
    body: 'Hello world',
    comments: buildMany(commentFactory, 5),
  },
});

const post = postFactory();

// post.comments.length === 5;
// post.comments[0].author.name will be 'John Doe 1';
```

## Overrides per-build

You'll often need to generate a random object but control one of the values directly for the purpose of testing. When you call a factory you can pass in overrides which will override the factory defaults:

```js
import { createFactory, sequence, perBuild } from '@datx/test-data-factory';
import { createClient } from './create-client';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

const userFactory = factory(User, {
  fields: {
    id: sequence(),
    name: 'john',
  },
});
const user = userFactory({
  overrides: {
    id: 1,
    name: 'John',
  },
});
// user.id === 1
// user.name === 'John'
```

## Editing object directly with `map`

If you need to edit the object directly, you can pass in a `map` function when you call the factory. This will be called after `@datx/test-data-factory` has generated the fake object, and lets you directly change its properties.

```js
import { createFactory, sequence, perBuild } from '@datx/test-data-factory';
import { createClient } from './create-client';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

const userFactory = factory(User, {
  fields: {
    id: sequence(),
    name: 'John',
  },
});

const user = userFactory({
  map: (user) => {
    user.name = user.name.toUpperCase();

    return user;
  },
});

// user.name === 'JOHN'
```

Using `overrides` and `map` lets you easily customize a specific object that a factory has created.

## Traits

Traits let you define a set of overrides for a factory that can easily be re-applied. Let's imagine you've got a users factory where users can be admins:

```js
import { createFactory } from '@datx/test-data-factory';
import { createClient } from './create-client';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

const userFactory = factory(User, {
  fields: {
    name: 'John',
    admin: false,
  },
  traits: {
    admin: {
      overrides: {
        admin: true,
      },
    },
  },
});
```

Notice that we've defined the `admin` trait here. You don't need to do this; you could easily override the `admin` field each time:

```js
const adminUser = userFactory({ overrides: { admin: true } });
```

But imagine that the field changes, or the way you represent admins changes. Or imagine setting an admin is not just one field but a few fields that need to change. Maybe an admin's email address always has to be a certain domain. We can define that behaviour once as a trait:

```ts
const userFactory = factory(User, {
  fields: {
    name: 'John',
    admin: false,
  },
  traits: {
    admin: {
      overrides: {
        admin: true,
      },
    },
  },
});
```

And now building an admin user is easy:

```js
const admin = userFactory({ traits: 'admin' });
```

You can define and use multiple traits when building an object. Be aware that if two traits override the same value, the one passed in last wins:

```js
// any properties defined in other-trait will override any that admin sets
const admin = userFactory({ traits: ['admin', 'other-trait'] });
```

## Using faker library?

```js
import { build, perBuild } from '@datx/test-data-factory';
// This can be any fake data library you like.
import fake from 'faker';

const userFactory = factory({
  // Within perBuild, call your faker library directly.
  name: perBuild(() => fake().name()),
});
```

## Using with JSON:API resources

When using this library with JSON:API resources, factory will automatically support `meta` and `links` fields.

```ts
import { Collection, Field, Model } from '@datx/core';
import { jsonapi, getModelMeta, getModelLinks } from '@datx/jsonapi';
import { createFactory, sequence, perBuild } from '@datx/test-data-factory';

class User extends jsonapi(Model) {
  public static type = 'users';

  @Field({ isIdentifier: true })
  public id!: number;

  @Field()
  public name!: string;
}

class JsonapiClient extends jsonapi(Collection) {
  public static types = [User];
}

const client = new JsonapiClient();
const factory = createFactory(client);

const userFactory = factory(User, {
  fields: {
    id: sequence(),
    name: 'John',
    meta: {
      foo: 'bar',
    },
    links: {
      self: 'https://example.com',
    },
  },
});

const user = userFactory();

const meta = getModelMeta(user);
const links = getModelLinks(user);

// meta.foo === 'bar';
// links.self === 'https://example.com';
```

## Using with Jest testing library

Here is an example of how to use this library with Jest testing library.

```ts
import { createFactory, sequence, perBuild } from '@datx/test-data-factory';
import { createClient } from './create-client';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

const userFactory = factory(User, {
  fields: {
    id: sequence(),
    name: 'John',
  },
});

describe('User', () => {
  beforeEach(() => {
    factory.reset();
  });

  it('should create a user', () => {
    const user = userFactory();

    expect(user.id).toBe(1);
    expect(user.name).toBe('John');
  });
});
```

> It is important to reset the factory before each test, otherwise the client will not be reset.

## Inspired by

- [@jackfranklin/test-data-bot](https://github.com/jackfranklin/test-data-bot) - Generate test data for your tests easily.
- [factory_bot](https://github.com/thoughtbot/factory_bot) - A library for setting up Ruby objects as test data
