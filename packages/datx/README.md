# datx

DatX is an opinionated data store for use with the [MobX](https://mobx.js.org/) state management library. It features support for simple observable property definition, references to other models and first-class TypeScript support.

The library is still work in progress, but it's feature complete. You can track the v1.0 status using the [v1.0 milestone](https://github.com/infinum/datx/milestone/1).

***

## Basic usage

```typescript
import { Collection, Model, prop } from 'datx';
import { computed } from 'mobx';

class Person extends Model {
  public static type = 'person'; // Unique name of the model class

  @prop name: string; // A normal observable property without a default value
  @prop surname: string;
  @prop.toOne(Person) spouse?: Person; // A reference to a Person model

  @computed get fullName() { // Standard MobX computed props
    return `${this.name} ${this.surname}`;
  }
}

class AppData extends Collection {
  public static types = [Person]; // A list of models available in the collection
}

const store = new AppData();
const john = store.add(new Person({name: 'John', surname: 'Smith'})); // Add a model instance to the store
const jane = store.add({name: 'Jane', surname: 'Smith', spouse: john}, Person); // Add a model to the store
```

## Getting started

Note: `datx` has a peer dependency to `mobx@^4.1.0`, so don't forget to install the latest MobX version:

```bash
npm install --save datx mobx
```
  * [Installation](https://github.com/infinum/datx/wiki/Installation)
  * [Defining models](https://github.com/infinum/datx/wiki/Defining-models)
  * [References](https://github.com/infinum/datx/wiki/References)
  * [Configuring the collection](https://github.com/infinum/datx/wiki/Configuring-the-collection)
  * [Using the collection](https://github.com/infinum/datx/wiki/Using-the-collection)
  * [Persisting data locally](https://github.com/infinum/datx/wiki/Persisting-data-locally)

### Polyfilling

The lib makes use of the following features that are not yet available everywhere. Based on your browser support, you might want to polyfill them:

  * [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
  * [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)

## Concepts

The library contains two main classes - [`Model`](https://github.com/infinum/datx/wiki/Model) and [`Collection`](https://github.com/infinum/datx/wiki/Collection).

A collection contains models of any kind (they should however be listed in the `types` property), while a model can be in a single collection (but doesn't need to be in any).

Models also include some useful [methods](https://github.com/infinum/datx/wiki/withActions) and [properties](https://github.com/infinum/datx/wiki/withMeta), but if they're in collision with your data/logic, you can use a [`PureModel`](https://github.com/infinum/datx/wiki/PureModel) class.

## Mixins

Mixins are additional plugins that can enhance the regular models and collections. Available mixins:
* [`withActions`](https://github.com/infinum/datx/wiki/withActions) (model) - Adds some helper methods to the model - already included in the `Model` class, but not in the `PureModel` class
* [`withMeta`](https://github.com/infinum/datx/wiki/withMeta) (model) - Adds some helpful meta data to the model - already included in the `Model` class, but not in the `PureModel` class
* [`datx-jsonapi`](https://github.com/infinum/datx/wiki/Mixin-JSONAPI) (model, collection and view) - Adds the [JSON API](http://jsonapi.org/) features to the model, collection and view

To check out what are the planed future mixins, check out [the issues](https://github.com/infinum/datx/labels/mixins).

Want to make your own mixin? Check out [the guide](https://github.com/infinum/datx/wiki/Building-your-own-mixin).

## API reference

  * [Collection](https://github.com/infinum/datx/wiki/Collection)
  * [Model](https://github.com/infinum/datx/wiki/Model)
  * [View](https://github.com/infinum/datx/wiki/View)
  * [prop](https://github.com/infinum/datx/wiki/prop)
  * [PureModel](https://github.com/infinum/datx/wiki/PureModel)
  * [CompatModel](https://github.com/infinum/datx/wiki/CompatModel)
  * [CompatCollection](https://github.com/infinum/datx/wiki/CompatCollection)
  * [Model utils](https://github.com/infinum/datx/wiki/Model-utils)
  * [Lib utils](https://github.com/infinum/datx/wiki/Lib-utils)
  * [TypeScript interfaces](https://github.com/infinum/datx/wiki/Interfaces)

***

[![Build Status](https://travis-ci.org/infinum/datx.svg?branch=master)](https://travis-ci.org/infinum/datx)

Package | npm version | dependency status | dev dependency status
--------|-------------|-------------------|----------------------
datx | [![npm version](https://badge.fury.io/js/datx.svg)](https://badge.fury.io/js/datx) | [![Dependency Status](https://david-dm.org/infinum/datx.svg?path=packages/datx)](https://david-dm.org/infinum/datx?path=packages/datx) | [![devDependency Status](https://david-dm.org/infinum/datx/dev-status.svg?path=packages/datx)](https://david-dm.org/infinum/datx?path=packages/datx#info=devDependencies)
datx-jsonapi | [![npm version](https://badge.fury.io/js/datx-jsonapi.svg)](https://badge.fury.io/js/datx-jsonapi) | [![Dependency Status](https://david-dm.org/infinum/datx.svg?path=packages/datx-jsonapi)](https://david-dm.org/infinum/datx?path=packages/datx-jsonapi) | [![devDependency Status](https://david-dm.org/infinum/datx/dev-status.svg?path=packages/datx-jsonapi)](https://david-dm.org/infinum/datx?path=packages/datx-jsonapi#info=devDependencies)
datx-utils | [![npm version](https://badge.fury.io/js/datx-utils.svg)](https://badge.fury.io/js/datx-utils) | [![Dependency Status](https://david-dm.org/infinum/datx.svg?path=packages/datx-utils)](https://david-dm.org/infinum/datx?path=packages/datx-utils) | [![devDependency Status](https://david-dm.org/infinum/datx/dev-status.svg?path=packages/datx-utils)](https://david-dm.org/infinum/datx?path=packages/datx-utils#info=devDependencies)

## License

The [MIT License](LICENSE)

## Credits

datx is maintained and sponsored by
[Infinum](http://www.infinum.co).

<img src="https://infinum.co/infinum.png" width="264">
