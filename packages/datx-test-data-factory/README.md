# @datx/test-data-factory

Rather than instancing random models each time you want to test something in your system you can instead use a _factory_ that can create fake data. This keeps your tests consistent and means that they always use data that replicates the real thing. If your tests work off objects close to the real thing they are more useful and there's a higher chance of them finding bugs.

```
npm install --save-dev @datx/test-data-factory
yarn add --dev @datx/test-data-factory
```

## Basic usage

We use the `build` function to create a factory. You give a factory an object of fields you want to define:

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

## Docs

- [Model](https://datx.dev/docs/testing/test-data-factory)

## Inspired by

- [@jackfranklin/test-data-bot](https://github.com/jackfranklin/test-data-bot) - Generate test data for your tests easily.
- [factory_bot](https://github.com/thoughtbot/factory_bot) - A library for setting up Ruby objects as test data

## Troubleshooting

Having issues with the library? Check out the [troubleshooting](https://datx.dev/docs/troubleshooting/known-issues) page or [open](https://github.com/infinum/datx/issues/new/choose) an issue.

---

[![Build Status](https://travis-ci.org/infinum/datx.svg?branch=master)](https://travis-ci.org/infinum/datx)

## License

The [MIT License](LICENSE)

## Credits

datx is maintained and sponsored by
[Infinum](https://www.infinum.co).

<p align="center">
  <a href='https://infinum.com'>
    <picture>
        <source srcset="https://assets.infinum.com/brand/logo/static/white.svg" media="(prefers-color-scheme: dark)">
        <img src="https://assets.infinum.com/brand/logo/static/default.svg">
    </picture>
  </a>
</p>
