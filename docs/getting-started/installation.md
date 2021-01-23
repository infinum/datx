---
id: installation
title: Installation
---

## Installation

To install, use `npm` or `yarn`. The lib has a peer dependency of `mobx` 4.2.0 or later.

```bash
npm install @datx/core mobx --save
```

```bash
yarn add @datx/core mobx
```

Since the lib is exposed as a set of CommonJS modules, you'll need something like [webpack](https://webpack.js.org/) or browserify in order to use it in the browser.

Don't forget to [prepare your code for production](https://webpack.js.org/guides/production/) for better performance!

## Polyfilling

The lib makes use of the following features that are not yet available everywhere. Based on your browser support, you might want to polyfill them:

- [Symbol.for](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
- [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [Array.prototype.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)

[How to add the polyfills](../troubleshooting/known-issues#the-library-doesnt-work-in-internet-explorer-11).
