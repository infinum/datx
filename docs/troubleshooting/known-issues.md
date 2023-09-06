---
id: known-issues
title: Known issues
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

## Usage in combination with Vite

If you're using DatX with Vite and MobX, you might have an issue where it works in dev builds, but not in production builds. This is because DatX needs the commonjs `require` in order to detect MobX support, but Vite doesn't transpile `require` calls in production builds for dependencies.

The solution is to use the `vite-plugin-require-transform` plugin to transform `require` calls in dependencies:

```js
// vite.config.js
import requireTransform from 'vite-plugin-require-transform';

export default {
  plugins: [
    requireTransform({
      fileRegex: /.ts$|.tsx$|node_modules\/@datx/,
    }),
  ],
};
```

Using `vite-plugin-commonjs` might also be a possibility, but it was not yet confirmed.

## Having other issues?

Feel free to [open an issue](https://github.com/infinum/datx/issues/new/choose).
