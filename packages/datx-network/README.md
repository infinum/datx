# @datx/network

DatX is an opinionated data store. It features support for references to other models and first-class TypeScript support.

`@datx/network` is a datx mixin that adds a networking layer support. It can be used with any REST-like API and probably also other types of an API.

---

## Basic usage

```tsx
import { Collection, Model, Attribute } from '@datx/core';
import { BaseRequest, collection, setUrl } from '@datx/network';

class Person extends Model {
  public static type = 'person'; // Unique name of the model class

  @Attribute()
  public name: string; // A normal attribute without a default value

  @Attribute()
  public surname: string;

  @Attribute({ toOne: Person })
  public spouse?: Person; // A reference to a Person model

  public get fullName() {
    return `${this.name} ${this.surname}`;
  }
}

class AppData extends Collection {
  public static types = [Person]; // A list of models available in the collection
}

const store = new AppData();

// Create a base request with a basic configuration (baseUrl and linked collection)
const baseRequest = new BaseRequest('https://example.com').pipe(collection(store));

// Create separate request points
const getPerson = baseRequest.pipe<Person>(setUrl('/people/{id}', Person));
const getPeople = baseRequest.pipe<Array<Person>>(setUrl('/people', Person));

// Pure JS loading
const peopleResponse = await getPeople.fetch();

// Loading in a React component
const PersonInfo = ({ userId }) => {
  const [response, loading, error] = getPerson.useHook({ id: userId });

  if (loading || error) {
    return null;
  }

  const user = response.data;

  return <div>{user.fullName}</div>;
};
```

## Getting started

```bash
npm install --save @datx/network
```

### Polyfilling

The lib makes use of the following features that are not yet available everywhere. Based on your browser support, you might want to polyfill them:

- [Symbol.for](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
- [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [Array.prototype.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
- [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

[How to add the polyfills](https://datx.dev/docs/troubleshooting/known-issues#the-library-doesnt-work-in-internet-explorer-11).
Note: Fetch API is not included in the polyfills mentioned in the Troubleshooting page. Instead, you need to add it as a separate library. If you don't have any special requirements (like server-side rendering), you can use the [window.fetch polyfill](https://github.com/github/fetch#installation).

## API reference

- [BaseRequest](https://datx.dev/docs/network/base-request)
- [Response](https://datx.dev/docs/network/response)
- [operators](https://datx.dev/docs/network/operators)
- [caching](https://datx.dev/docs/network/caching)
- [interceptors](https://datx.dev/docs/network/interceptors)
- [parse/serialize](https://datx.dev/docs/network/parse-serialize)
- [fetching](https://datx.dev/docs/network/fetching)
- [TypeScript Interfaces](https://datx.dev/docs/network/typescript-interfaces)

## Troubleshooting

Having issues with the library? Check out the [troubleshooting](https://datx.dev/docs/troubleshooting/known-issues) page or [open](https://github.com/infinum/datx/issues/new/choose) an issue.

---

[![Build Status](https://travis-ci.org/infinum/datx.svg?branch=master)](https://travis-ci.org/infinum/datx)
[![npm version](https://badge.fury.io/js/@datx/network.svg)](https://badge.fury.io/js/@datx/network)
[![Dependency Status](https://david-dm.org/infinum/datx.svg?path=packages/@datx/network)](https://david-dm.org/infinum/datx?path=packages/@datx/network)
[![devDependency Status](https://david-dm.org/infinum/datx/dev-status.svg?path=packages/@datx/network)](https://david-dm.org/infinum/datx?path=packages/@datx/network#info=devDependencies)

## License

The [MIT License](LICENSE)

## Credits

@datx/network is maintained and sponsored by
[Infinum](https://www.infinum.com).

<p align="center">
  <a href='https://infinum.com'>
    <picture>
        <source srcset="https://assets.infinum.com/brand/logo/static/white.svg" media="(prefers-color-scheme: dark)">
        <img src="https://assets.infinum.com/brand/logo/static/default.svg">
    </picture>
  </a>
</p>
