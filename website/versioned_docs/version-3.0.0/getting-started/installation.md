---
id: version-3.0.0-installation
title: Installation
original_id: installation
---

## Installation

To install, use `npm` or `yarn`.

```bash
npm install @datx/core --save
```

```bash
yarn add @datx/core
```

Since the lib is exposed as a set of CommonJS modules, you'll need something like [webpack](https://webpack.js.org/) or browserify in order to use it in the browser.

Don't forget to [prepare your code for production](https://webpack.js.org/guides/production/) for better performance!

## Polyfilling

The lib makes use of the following features that are not yet available everywhere. Based on your browser support, you might want to polyfill them:

- [Symbol.for](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
- [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [Array.prototype.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)

[How to add the polyfills](../troubleshooting/known-issues#the-library-doesnt-work-in-internet-explorer-11).
