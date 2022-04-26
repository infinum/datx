# @datx/jsonapi

DatX is an opinionated data store. It features support for references to other models and first-class TypeScript support.

`@datx/jsonapi` is a datx mixin that adds [JSON API](https://jsonapi.org/) support.

---

## Basic usage

```typescript
import { Collection, Model, Attribute } from '@datx/core';
import { jsonapi } from '@datx/jsonapi';

class Person extends jsonapi(Model) {
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

class AppData extends jsonapi(Collection) {
  public static types = [Person]; // A list of models available in the collection
}

const store = new AppData();
const john = store.add(new Person({ name: 'John', surname: 'Smith' })); // Add a model instance to the store
const jane = store.add({ name: 'Jane', surname: 'Smith', spouse: john }, Person); // Add a model to the store

await john.save(); // POST to the server
const people = await store.fetchAll(Person); // Get all people from the server
```

## Getting started

```bash
npm install --save @datx/jsonapi
```

- [Basic configuration](https://datx.dev/docs/jsonapi/jsonapi-basic-configuration)
- [Network configuration](https://datx.dev/docs/jsonapi/jsonapi-network-configuration)
- [Network usage](https://datx.dev/docs/jsonapi/jsonapi-network-usage)
- [Spec compliance](https://datx.dev/docs/jsonapi/jsonapi-spec-compliance)

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

- [Model](https://datx.dev/docs/jsonapi/jsonapi-model)
- [Collection](https://datx.dev/docs/jsonapi/jsonapi-collection)
- [View](https://datx.dev/docs/jsonapi/jsonapi-view)
- [Response](https://datx.dev/docs/jsonapi/jsonapi-response)
- [Config](https://datx.dev/docs/jsonapi/jsonapi-config)
- [Utils](https://datx.dev/docs/jsonapi/jsonapi-utils)
- [TypeScript Interfaces](https://datx.dev/docs/jsonapi/jsonapi-typescript-interfaces)

## Troubleshooting

Having issues with the library? Check out the [troubleshooting](https://datx.dev/docs/troubleshooting/known-issues) page or [open](https://github.com/infinum/datx/issues/new/choose) an issue.

---

[![Build Status](https://travis-ci.org/infinum/datx.svg?branch=master)](https://travis-ci.org/infinum/datx)
[![npm version](https://badge.fury.io/js/@datx/jsonapi.svg)](https://badge.fury.io/js/@datx/jsonapi)
[![Dependency Status](https://david-dm.org/infinum/datx.svg?path=packages/@datx/jsonapi)](https://david-dm.org/infinum/datx?path=packages/@datx/jsonapi)
[![devDependency Status](https://david-dm.org/infinum/datx/dev-status.svg?path=packages/@datx/jsonapi)](https://david-dm.org/infinum/datx?path=packages/@datx/jsonapi#info=devDependencies)

## License

The [MIT License](LICENSE)

## Credits

datx-jsonapi is maintained and sponsored by
[Infinum](https://www.infinum.com).

<img src="https://infinum.com/infinum.png" width="264">
