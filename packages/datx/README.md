# DatX

DatX is an opinionated JS/TS data store. It features support for simple property definition, references to other models and first-class TypeScript support.

By default, it uses the [MobX](https://mobx.js.org/) state management library, but this is optional and can be used as a pure JS library.

***

## Basic usage

```typescript
import { Collection, Model, Attribute } from '@datx/core';
import { computed } from 'mobx';

class Person extends Model {
  public static type = 'person'; // Unique name of the model class

  @Attribute() 
  public name!: string; // A normal property without a default value
  
  @Attribute()
  public surname!: string;
  
  @Attribute({ toOne: Person })
  public spouse?: Person; // A reference to a Person model

  @computed
  public get fullName() { // Standard MobX computed props
    return `${this.name} ${this.surname}`;
  }
}

class AppData extends Collection {
  public static types = [Person]; // A list of models available in the collection
}

const store = new AppData();
const john = store.add(new Person({ name: 'John', surname: 'Smith' })); // Add a model instance to the store
const jane = store.add({ name: 'Jane', surname: 'Smith', spouse: john }, Person); // Add a model to the store
```

## Getting started

```bash
npm install --save @datx/core
```

  * [Installation](https://datx.dev/docs/getting-started/installation)
  * [Defining models](https://datx.dev/docs/getting-started/defining-models)
  * [References](https://datx.dev/docs/getting-started/references)
  * [Configuring the collection](https://datx.dev/docs/getting-started/configuring-the-collection)
  * [Using the collection](https://datx.dev/docs/getting-started/using-the-collection)
  * [Persisting data locally](https://datx.dev/docs/getting-started/persisting-data-locally)

### Polyfilling

The lib makes use of the following features that are not yet available everywhere. Based on your browser support, you might want to polyfill them:

  * [Symbol.for](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
  * [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  * [Array.prototype.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)

[How to add the polyfills](https://datx.dev/docs/troubleshooting/known-issues#the-library-doesnt-work-in-internet-explorer-11).

## Concepts

The library contains two main classes - [`Model`](https://datx.dev/docs/api-reference/model) and [`Collection`](https://datx.dev/docs/api-reference/collection).

A collection contains models of any kind (they should however be listed in the `types` property), while a model can be in a single collection (but doesn't need to be in any).

Models also include some useful [methods](https://datx.dev/docs/mixins/with-actions) and [properties](https://datx.dev/docs/mixins/with-meta), but if they're in collision with your data/logic, you can use a [`PureModel`](https://datx.dev/docs/api-reference/pure-model) class.

## Mixins

Mixins are additional plugins that can enhance the regular models and collections. Available mixins:
* [`withActions`](https://datx.dev/docs/mixins/with-actions) (model) - Adds some helper methods to the model - already included in the `Model` class, but not in the `PureModel` class
* [`withMeta`](https://datx.dev/docs/mixins/with-meta) (model) - Adds some helpful meta data to the model - already included in the `Model` class, but not in the `PureModel` class
* [`withPatches`](https://datx.dev/docs/mixins/with-patches) (model, collection) - Adds patch support to models and collections
* [`datx-jsonapi`](https://datx.dev/docs/mixins/jsonapi-mixin) (model, collection and view) - Adds the [JSON API](https://jsonapi.org/) features to the model, collection and view

To check out what are the planed future mixins, check out [the issues](https://github.com/infinum/datx/labels/mixins).

Want to make your own mixin? Check out [the guide](https://datx.dev/docs/mixins/building-your-own-mixin).

## API reference

  * [Collection](https://datx.dev/docs/api-reference/collection)
  * [Model](https://datx.dev/docs/api-reference/model)
  * [View](https://datx.dev/docs/api-reference/view)
  * [prop](https://datx.dev/docs/api-reference/prop)
  * [PureModel](https://datx.dev/docs/api-reference/pure-model)
  * [CompatModel](https://datx.dev/docs/migration-guide/compat-model)
  * [CompatCollection](https://datx.dev/docs/migration-guide/compat-collection)
  * [Model utils](https://datx.dev/docs/api-reference/model-utils)
  * [Lib utils](https://datx.dev/docs/api-reference/lib-utils)
  * [TypeScript interfaces](https://datx.dev/docs/api-reference/typescript-interfaces)

## Troubleshooting

Having issues with the library? Check out the [troubleshooting](https://datx.dev/docs/troubleshooting/known-issues) page or [open](https://github.com/infinum/datx/issues/new/choose) an issue.

***

[![Build Status](https://travis-ci.org/infinum/datx.svg?branch=master)](https://travis-ci.org/infinum/datx)

## License

The [MIT License](LICENSE)

## Credits

datx is maintained and sponsored by
[Infinum](https://www.infinum.co).

<img src="https://infinum.co/infinum.png" width="264">
