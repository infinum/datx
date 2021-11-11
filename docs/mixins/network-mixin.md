---
id: network-mixin
title: Network Mixin
---

If you're using an API for your application, you can install `datx-network` to take the full advantage of the `datx` library:

```bash
npm install --save datx datx-network mobx
```

**Note** If you're using the [JSON API specification](https://jsonapi.org/), check out [datx-jsonapi](./jsonapi-mixin) instead.

## Polyfilling

The lib makes use of the following features that are not yet available everywhere. Based on your browser support, you might want to polyfill them:

- [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

## Documentation

- [BaseRequest](../network/base-request)
- [Response](../network/response)
- [operators](../network/operators)
- [caching](../network/caching)
- [interceptors](../network/interceptors)
- [parser](../network/operators#parser) / [serializer](../network/operators#serializer)
- [fetching](../network/fetching)
- [TypeScript Interfaces](../network/typescript-interfaces)
