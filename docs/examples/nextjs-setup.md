---
id: nextjs-setup
title: Next.js setup
---

## Preface

Just like in basic [react-setup](react-setup), we will use the `react-mobx ^6.x` since we will be only using functional components and pages with [hooks](https://reactjs.org/docs/hooks-intro.html).

If your codebase does not support hooks, you can check out [mobx-react docs](https://mobx-react.js.org/libraries) for more info.

## Steps

- [Setup nextjs app](./nextjs-setup#setup-nextjs)
- [Setup your collection and models](./basic-setup)
- [withDatx HOC](./nextjs-setup#withDatx)


## Setup nextjs app

We will use [`create-next-app`](https://nextjs.org/blog/create-next-app) CLI for generate our nextjs app.

In your terminal run:

```bash
yarn start next-app

---or with npx---

npx create-next-app
```


If you want to add typescript support:

```bash
yarn start next-app --example with-typescript your-app-name

---or with npx---

npx create-next-app --example with-typescript your-app-name
```

## withDatx HOC

```tsx
import { NextPage, NextPageContext } from 'next';
import App from 'next/app';
import React from 'react';

import { getOrInitializeStore } from '../../stores/getOrInitializeStore';
import { AppStore } from '../../stores/AppStore';

const StoreContext = React.createContext<AppStore | null>(null);

export const useStores = () => React.useContext(StoreContext);

interface IOptions {
  ssr: boolean;
}

export type ContextWithStore = NextPageContext & { store: AppStore };

// Extend NextPage type's context with 'store' (which is of type RootStore)
export type NextPageWithDatx<P = {}, IP = P> = NextPage<P, IP> & {
  getInitialProps?: (ctx: ContextWithStore) => Promise<IP>;
};

export const withDatx = (PageComponent: NextPageWithDatx, options: IOptions = { ssr: true }) => {
  const WithDatx = ({ initialMobxState, ...props }: any) => {
    const store: AppStore = getOrInitializeStore(initialMobxState);

    return (
      <StoreContext.Provider value={store}>
        <PageComponent {...props} />
      </StoreContext.Provider>
    );
  };

  // Make sure people don't use this HOC on _app.js level
  if (process.env.NODE_ENV !== 'production') {
    const isAppHoc = PageComponent.prototype instanceof App;
    if (isAppHoc) {
      throw new Error('The withDatx HOC only works with PageComponents');
    }
  }

  // Set the correct displayName in development
  if (process.env.NODE_ENV !== 'production') {
    const displayName = PageComponent.displayName || PageComponent.name || 'Component';
    WithDatx.displayName = `withDatx(${displayName})`;
  }

  const { ssr = true } = options;

  if (ssr || PageComponent.getInitialProps) {
    WithDatx.getInitialProps = async (context: NextPageContext) => {
      // Get or Create the store with `undefined` as initialState
      // This allows you to set a custom default initialState
      const store = getOrInitializeStore();

      // Provide the store to getInitialProps of pages
      // Run getInitialProps from HOCed PageComponent
      const pageProps: any =
        typeof PageComponent.getInitialProps === 'function'
          ? await PageComponent.getInitialProps({ ...context, store })
          : {};
          
      // Pass props to PageComponent
      return {
        ...pageProps,
        initialMobxState: store.snapshot,
      };
    };
  }

  return WithDatx;
};
```
