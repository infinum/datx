# datx-jsonapi

DatX is an opinionated data store for use with the [MobX](https://mobx.js.org/) state management library. It features support for simple observable property definition, references to other models and first-class TypeScript support.

`datx-jsonapi` is a datx mixin that adds [JSON API](http://jsonapi.org/) support.

***

## Basic usage

```typescript
import { Collection, Model, prop } from 'datx';
import { jsonapi } from 'datx-jsonapi';
import { computed } from 'mobx';

class Person extends jsonapi(Model) {
  public static type = 'person'; // Unique name of the model class

  @prop name: string; // A normal observable property without a default value
  @prop surname: string;
  @prop.toOne(Person) spouse?: Person; // A reference to a Person model

  @computed get fullName() { // Standard MobX computed props
    return `${this.name} ${this.surname}`;
  }
}

class AppData extends jsonapi(Collection) {
  public static types = [Person]; // A list of models available in the collection
}

const store = new AppData();
const john = store.add(new Person({name: 'John', surname: 'Smith'})); // Add a model instance to the store
const jane = store.add({name: 'Jane', surname: 'Smith', spouse: john}, Person); // Add a model to the store

await john.save(); // POST to the server
const people = await store.fetchAll(Person); // Get all people from the server
```

## Getting started

Note: `datx-jsonapi` has a peer dependency to `mobx@^4.1.0`, so don't forget to install the latest MobX version:

```bash
npm install --save datx-jsonapi mobx
```

  * [Basic configuration](https://github.com/infinum/datx/wiki/Basic-configuration)
  * [Network configuration](https://github.com/infinum/datx/wiki/Network-configuration)
  * [Network usage](https://github.com/infinum/datx/wiki/Network-usage)
  * [Spec compliance](https://github.com/infinum/datx/wiki/Spec-compliance)

## API reference
  
  * [Model](https://github.com/infinum/datx/wiki/JSONAPI-Model)
  * [Collection](https://github.com/infinum/datx/wiki/JSONAPI-Collection)
  * [Response](https://github.com/infinum/datx/wiki/JSONAPI-Response)
  * [Config](https://github.com/infinum/datx/wiki/JSONAPI-Config)
  * [Utils](https://github.com/infinum/datx/wiki/JSONAPI-Utils)
  * [TypeScript Interfaces](https://github.com/infinum/datx/wiki/JSONAPI-Interfaces)

***

[![Build Status](https://travis-ci.org/infinum/datx.svg?branch=master)](https://travis-ci.org/infinum/datx)
[![npm version](https://badge.fury.io/js/datx-jsonapi.svg)](https://badge.fury.io/js/datx-jsonapi)
[![Dependency Status](https://david-dm.org/infinum/datx.svg?path=packages/datx-jsonapi)](https://david-dm.org/infinum/datx?path=packages/datx-jsonapi)
[![devDependency Status](https://david-dm.org/infinum/datx/dev-status.svg?path=packages/datx-jsonapi)](https://david-dm.org/infinum/datx?path=packages/datx-jsonapi#info=devDependencies)

## License

The [MIT License](LICENSE)

## Credits

datx-jsonapi is maintained and sponsored by
[Infinum](http://www.infinum.co).

<img src="https://infinum.co/infinum.png" width="264">
