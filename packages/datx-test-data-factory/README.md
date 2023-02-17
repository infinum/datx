# @datx/test-data-factory

Rather than instancing random models each time you want to test something in your system you can instead use a _factory_ that can create fake data. This keeps your tests consistent and means that they always use data that replicates the real thing. If your tests work off objects close to the real thing they are more useful and there's a higher chance of them finding bugs.

```
npm install --save-dev @datx/test-data-factory
yarn add --dev @datx/test-data-factory
```

## Creating your first factory

We use the `build` function to create a builder. You give a builder an object of fields you want to define:

```js
import { createFactory } from '@datx/test-data-factory';
import { createClient } from './create-client';
import { User } from './models/User';

const client = createClient();
const factory = createFactory(client);

const userFactory = factory(User, {
  fields: {
    name: 'jack',
  },
});

const user = userFactory();

console.log(user); // => { name: 'jack'}
```

_While the examples in this README use `require`, you can also use `import {build} from '@datx/test-data-factory'`._

Once you've created a builder, you can call it to generate an instance of that object - in this case, a `user`.

It would be boring though if each user had the same `name` - so test-data-bot lets you generate data via some API methods:

### Incrementing IDs with `sequence`

Often you will be creating objects that have an ID that comes from a database, so you need to guarantee that it's unique. You can use `sequence`, which increments every time it's called:

```js
const { build, sequence } = require('@datx/test-data-factory');
const userBuilder = build({
  fields: {
    id: sequence(),
  },
});
const userOne = userBuilder();
const userTwo = userBuilder();
// userOne.id === 1
// userTwo.id === 2
```

If you need more control, you can pass `sequence` a function that will be called with the number. This is useful to ensure completely unique emails, for example:

```js
const { build, sequence } = require('@datx/test-data-factory');
const userBuilder = build({
  fields: {
    email: sequence(x => `jack${x}@gmail.com`),
  },
});
const userOne = userBuilder();
const userTwo = userBuilder();
// userOne.email === jack1@gmail.com
// userTwo.email === jack2@gmail.com
```

You can use the `reset` method to reset the counter used internally when generating a sequence:

```js
const { build, sequence } = require('@datx/test-data-factory');
const userBuilder = build({
  fields: {
    id: sequence(),
  },
});
const userOne = userBuilder();
const userTwo = userBuilder();
userBuilder.reset();
const userThree = userBuilder();
const userFour = userBuilder();
// userOne.id === 1
// userTwo.id === 2
// userThree.id === 1 <- the sequence has been reset here
// userFour.id === 2
```

### Randomly picking between an option

If you want an object to have a random value, picked from a list you control, you can use `oneOf`:

```js
const { build, oneOf } = require('@datx/test-data-factory');
const userBuilder = build({
  fields: {
    name: oneOf('alice', 'bob', 'charlie'),
  },
});
```

### `bool`

If you need something to be either `true` or `false`, you can use `bool`:

```js
const { build, bool } = require('@datx/test-data-factory');
const userBuilder = build({
  fields: {
    isAdmin: bool(),
  },
});
```

### `perBuild`

test-data-bot lets you declare a field to always be a particular value:

```js
const { build, perBuild } = require('@datx/test-data-factory');
const userBuilder = build({
  fields: {
    name: 'jack',
    details: {},
  },
});
```

A user generated from this builder will always be the same data. However, if you generate two users using the builder above, they will have _exactly the same object_ for the `details` key:

```js
const userOne = userBuilder();
const userTwo = userBuilder();
userOne.details === userTwo.details; // true
```

If you want to generate a unique object every time, you can use `perBuild` which takes a function and executes it when a builder is built:

```js
const { build, perBuild } = require('@datx/test-data-factory');
const userBuilder = build({
  fields: {
    name: 'jack',
    details: perBuild(() => {
      return {};
    }),
  },
});
const userOne = userBuilder();
const userTwo = userBuilder();
userOne.details === userTwo.details; // false
```

This approach also lets you use any additional libraries, say if you wanted to use a library to generate fake data:

```js
const myFakeLibrary = require('whatever-library-you-want');
const { build, perBuild } = require('@datx/test-data-factory');
const userBuilder = build({
  fields: {
    name: perBuild(() => myFakeLibrary.randomName()),
  },
});
```

### Mapping over all the created objects with `postBuild`

If you need to transform an object in a way that test-data-bot doesn't support out the box, you can pass a `postBuild` function when creating a builder. This builder will run every time you create an object from it.

```js
const { build, fake } = require('@datx/test-data-factory');
const userBuilder = build({
  fields: {
    name: fake(f => f.name.findName()),
  },
  postBuild: user => {
    user.name = user.name.toUpperCase();
    return user;
  },
});
const user = userBuilder();
// user.name will be uppercase
```

## Overrides per-build

You'll often need to generate a random object but control one of the values directly for the purpose of testing. When you call a builder you can pass in overrides which will override the builder defaults:

```js
const { build, fake, sequence } = require('@datx/test-data-factory');
const userBuilder = build({
  fields: {
    id: sequence(),
    name: fake(f => f.name.findName()),
  },
});
const user = userBuilder({
  overrides: {
    id: 1,
    name: 'jack',
  },
});
// user.id === 1
// user.name === 'jack'
```

If you need to edit the object directly, you can pass in a `map` function when you call the builder. This will be called after test-data-bot has generated the fake object, and lets you directly change its properties.

```js
const { build, sequence } = require('@datx/test-data-factory');
const userBuilder = build('User', {
  fields: {
    id: sequence(),
    name: 'jack',
  },
});
const user = userBuilder({
  map: user => {
    user.name = user.name.toUpperCase();
    return user;
  },
});
```

Using `overrides` and `map` lets you easily customise a specific object that a builder has created.

## Traits (*new in v1.3*)

Traits let you define a set of overrides for a factory that can easily be re-applied. Let's imagine you've got a users factory where users can be admins:

```ts
interface User {
  name: string;
  admin: boolean;
}
const userBuilder = build<User>({
  fields: {
    name: 'jack',
    admin: false,
  },
  traits: {
    admin: {
      overrides: { admin: true },
    },
  },
});
```

Notice that we've defined the `admin` trait here. You don't need to do this; you could easily override the `admin` field each time:

```js
const adminUser = userBuilder({ overrides: { admin: true } });
```

But imagine that the field changes, or the way you represent admins changes. Or imagine setting an admin is not just one field but a few fields that need to change. Maybe an admin's email address always has to be a certain domain. We can define that behaviour once as a trait:

```ts
const userBuilder = build<User>({
  fields: {
    name: 'jack',
    admin: false,
  },
  traits: {
    admin: {
      overrides: { admin: true },
    },
  },
});
```

And now building an admin user is easy:

```js
const admin = userBuilder({ traits: 'admin' });
```

You can define and use multiple traits when building an object. Be aware that if two traits override the same value, the one passed in last wins:

```
// any properties defined in other-trait will override any that admin sets
const admin = userBuilder({ traits: ['admin', 'other-trait'] });
```

## TypeScript support

test-data-bot is written in TypeScript and ships with the types generated so if you're using TypeScript you will get some nice type support out the box.

The builders are generic, so you can describe to test-data-bot exactly what object you're creating:

```ts
interface User {
  id: number;
  name: string;
}
const userBuilder = build<User>('User', {
  fields: {
    id: sequence(),
    name: perBuild(() => yourCustomFakerLibary().name)
  },
});
const users = userBuilder();
```

You should get TypeScript errors if the builder doesn't satisfy the interface you've given it.

## Using faker library?

Prior to v2.0.0 of this library, we shipped built-in support for using Faker.js to generate data. It was removed because it was a big dependency to ship to all users, even those who don't use faker. If you want to use it you can, in combination with the `perBuild` builder:

```js
import {build, perBuild} from '@datx/test-data-factory';
// This can be any fake data library you like.
import fake from 'faker';

const userFactory = factory({
  // Within perBuild, call your faker library directly.
  name: perBuild(() => fake().name())
})
```

## Inspired by

- [@jackfranklin/test-data-bot](https://github.com/jackfranklin/test-data-bot) - Generate test data for your tests easily.
- [factory_bot](https://github.com/thoughtbot/factory_bot) - A library for setting up Ruby objects as test data
