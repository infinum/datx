---
id: version-2.0.0-known-issues
title: Known issues
original_id: known-issues
---

## The library doesn't work in Internet Explorer 11

Make sure you're polyfilling all required functionality:

- [Symbol.for](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
- [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [Array.prototype.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)

The easiest way is to add a generic polyfill:

- [Babel 6](https://babeljs.io/docs/en/6.26.3/babel-polyfill) - Install `babel-polyfill@6` and import it in your entry file
- [Babel 7](https://babeljs.io/docs/en/babel-polyfill) - Install `@babel/polyfill` and import it in your entry file
- TypeScript - If you're using the target `ES3`, `ES5` or you don't have a target defined, you should add the lib `ES2015` to your [`tsconfig.json` compiler options](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).

## Having other issues?

Feel free to [open an issue](https://github.com/infinum/datx/issues/new/choose).
