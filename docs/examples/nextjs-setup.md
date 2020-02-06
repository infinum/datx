---
id: nextjs-setup
title: Nextjs Setup
---

## Set up your collection

```typescript
import { Collection } from 'datx';

export default class AppStore extends Collection {
  public static types = [Person];
}
```

## _app page configuration

There are couple of steps that you're gonna have to do in order to properly setup datx withyour next.js app.

* You have to check wether you app is being served server side (with isServer() util) so your new collection instance can be properly return/created.
* You will extend the default page context with your generated store instance.
* Pass your store to the [Provider](https://github.com/mobxjs/mobx-react#provider-and-inject) component.

<!--DOCUSAURUS_CODE_TABS-->
<!--TypeScript-->

```tsx
import App from 'next/app';
import { Provider } from 'mobx-react';


import { AppStore } from '../store/AppStore';
import { isServer } from '../utils/isServer';


function generateStore(snapshot?: any): AppStore {
  if (isServer()) {
    return new AppStore(snapshot);
  }

  if (!global['appStore']) {
    global['appStore'] = new AppStore(snapshot);
  }

  return global['appStore'];
}


class MyApp extends App {
  public static async getInitialProps({ Component, ctx }: any) {
    let pageProps = {};
    const store = generateStore();

    if (Component.getInitialProps) {
      /* By extending page context, store will become a part of
      every page context that comes with Page.getInitialProps call */
      const pageCtx = { ...ctx, store };
      pageProps = await Component.getInitialProps(pageCtx);
    }

    return { pageProps, snapshot: store.snapshot };
  }

  private store!: AppStore;

  constructor(props: any) {
    super(props);

    this.store = generateStore(props.snapshot);
  }

  public render() {
    const { Component, pageProps } = this.props;

    return (
      <Provider store={this.store}>
        <Component {...pageProps} />
      </Provider>
    );
  }
}

export default MyApp;

```

<!--JavaScript-->

```tsx
import App from 'next/app';
import { Provider } from 'mobx-react';


import { AppStore } from '../store/AppStore';
import { isServer } from '../utils/isServer';


function generateStore(snapshot) {
  if (isServer()) {
    return new AppStore(snapshot);
  }

  if (!global['appStore']) {
    global['appStore'] = new AppStore(snapshot);
  }

  return global['appStore'];
}


class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    const store = generateStore();

    if (Component.getInitialProps) {
      /* By extending page context, store will become a part of
      every page context that comes with Page.getInitialProps call */
      const pageCtx = { ...ctx, store };
      pageProps = await Component.getInitialProps(pageCtx);
    }

    return { pageProps, snapshot: store.snapshot };
  }

  store: AppStore;

  constructor(props) {
    super(props);

    this.store = generateStore(props.snapshot);
  }

  public render() {
    const { Component, pageProps } = this.props;

    return (
      <Provider store={this.store}>
        <Component {...pageProps} />
      </Provider>
    );
  }
}

export default MyApp;
```

<!--END_DOCUSAURUS_CODE_TABS-->
