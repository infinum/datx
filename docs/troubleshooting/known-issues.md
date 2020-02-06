---
id: known-issues
title: Known issues
---

## Relationships don't work

Due to some inconsistent behaviour with a combination of class properties and decorators in Babel 7, `@prop` decorator can't be used in some setups. Instead, you can use `prop` [as a function](../getting-started/defining-models#javascript-without-decorators).

## Property values are undefined

Due to some inconsistent behaviour in some Babel 7 versions (related to the class properties), a [workaround with a model constructor](https://github.com/infinum/js-cra-starter/pull/2) is required.

## The library doesn't work in Internet Explorer 11

Make sure you're polyfilling all required functionality:
  * [Symbol.for](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
  * [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  * [Array.prototype.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)

The easiest way is to add a generic polyfill:
* [Babel 6](https://babeljs.io/docs/en/6.26.3/babel-polyfill) - Install `babel-polyfill@6` and import it in your entry file
* [Babel 7](https://babeljs.io/docs/en/babel-polyfill) - Install `@babel/polyfill` and import it in your entry file
* TypeScript - If you're using the target `ES3`, `ES5` or you don't have a target defined, you should add the lib `ES2015` to your [`tsconfig.json` compiler options](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).

## I'm getting a maximum call stack error

This can happen if you have an existing model instance, but want to update it with new relationships. Make sure you declare all relationships in the model class or use the `addReference` method to add new dynamic references. This issue should be fixed once [#108](https://github.com/infinum/datx/pull/108) is done.

## Having other issues?
Feel free to [open an issue](https://github.com/infinum/datx/issues/new).
