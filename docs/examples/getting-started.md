---
id: examples-getting-started
title: Getting started
---

## Henlo

<details>
  <summary><b>Examples</b></summary>
  <ul>
    <li><a href="https://github.com/zeit/next.js/tree/canary/examples/basic-css">Styled JSX</a></li>
    <li><a href="https://github.com/zeit/next.js/tree/canary/examples/with-styled-components">Styled Components</a></li>
    <li><a href="https://github.com/zeit/next.js/tree/canary/examples/with-styletron">Styletron</a></li>
    <li><a href="https://github.com/zeit/next.js/tree/canary/examples/with-glamor">Glamor</a></li>
    <li><a href="https://github.com/zeit/next.js/tree/canary/examples/with-cxs">Cxs</a></li>
    <li><a href="https://github.com/zeit/next.js/tree/canary/examples/with-aphrodite">Aphrodite</a></li>
    <li><a href="https://github.com/zeit/next.js/tree/canary/examples/with-fela">Fela</a></li>
  </ul>
</details>

The simplest way to handle authentication is inside of the network transformers:

```typescript
import { config, ICollectionFetchOpts, IRawResponse } from 'datx-jsonapi';

import { MyCollection } from '../state/MyCollection';

config.transformResponse = (opts: IRawResponse) => {
  // Check if the server sent a token (either after login or a refreshed token)
  const authToken = opts.headers && opts.headers.get('x-auth-token');

  if (authToken && opts.collection) {
    // Save the token as a collection property
    // there might be better ways to save the token (e.g. a Settings model), but this is the simplest one
    (opts.collection as MyCollection).token = authToken;
  }

  return opts;
};

config.transformRequest = (opts: ICollectionFetchOpts) => {
  const store: AppData = opts.collection as AppData;

  // Prepare options
  if (!opts.options) {
    opts.options = {};
  }
  if (!opts.options.headers) {
    opts.options.headers = {};
  }

  if (store.token) {
    // Set the request header
    opts.options.headers['Authorization'] = `Token ${store.token}`;
  }

  return opts;
};
```