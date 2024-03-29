---
id: version-3.0.0-getting-started
title: Getting started with DatX Network
original_id: getting-started
---

# Getting started

```bash
npm install --save datx-network
```

## Polyfilling

The lib makes use of the following features that are not yet available everywhere. Based on your browser support, you might want to polyfill them:

- [Symbol.for](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
- [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [Array.prototype.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
- [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

[How to add the polyfills](https://datx.dev/docs/troubleshooting/known-issues#the-library-doesnt-work-in-internet-explorer-11).
Note: Fetch API is not included in the polyfills mentioned in the Troubleshooting page. Instead, you need to add it as a separate library. If you don't have any special requirements (like server-side rendering), you can use the [window.fetch polyfill](https://github.com/github/fetch#installation).
