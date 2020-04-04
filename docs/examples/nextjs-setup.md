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
- [Store utils](./nextjs-setup#store-utils)
- [withDatx HOC](./nextjs-setup#withDatx)
- [Use your store](./nextjs-setup#use-your-store)


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

## Store utils
### `getOrInitializeStore`
`getOrInitializeStore` utils will take care of:
- Creating a new store instance when we load our app on the server
- Return a new store instance when we do client routing on the app

<!--DOCUSAURUS_CODE_TABS-->
<!--TypeScript-->

```tsx
import { IRawCollection } from 'datx/dist/interfaces/IRawCollection';

import { AppStore } from './AppStore';

const __NEXT_MOBX_STORE__ = 'store';

declare global {
  interface Window {
    store: AppStore;
  }
}

const isBrowser = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

const isServer = !isBrowser;

export function getOrInitializeStore(initialState?: IRawCollection): AppStore {
  // Always make a new store if on the server, otherwise the state is shared between requests
  if (isServer) {
    return new AppStore(initialState);
  }

  // This will be true if the page constructor is called on the client
  if (!window[__NEXT_MOBX_STORE__]) {
    window[__NEXT_MOBX_STORE__] = new AppStore(initialState);
  }

  return window[__NEXT_MOBX_STORE__];
}
```
<!--JavaScript-->

```jsx
import { IRawCollection } from 'datx/dist/interfaces/IRawCollection';

const __NEXT_MOBX_STORE__ = 'store';

const isBrowser = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

const isServer = !isBrowser;

export function getOrInitializeStore(initialState) {
  // Always make a new store if on the server, otherwise the state is shared between requests
  if (isServer) {
    return new AppStore(initialState);
  }

  // This will be true if the page constructor is called on the client
  if (!window[__NEXT_MOBX_STORE__]) {
    window[__NEXT_MOBX_STORE__] = new AppStore(initialState);
  }

  return window[__NEXT_MOBX_STORE__];
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

### `useStores` hook

Our `useStores` hook will get access to the `storeContext` via [useContext](https://reactjs.org/docs/hooks-reference.html#usecontext) hook and give us an object of our stores we added as value to our `<StoreProvider>`.

<!--DOCUSAURUS_CODE_TABS-->
<!--TypeScript-->

```tsx
import { useContext, createContext, ReactNode } from 'react';

import AppStore from './AppStore';

export interface IStores {
  store: AppStore;
}

interface IProviderProps {
  children: ReactNode;
}

const storeContext = createContext<IStores>({ store });

const StoreProvider = ({ children }: IProviderProps) => {
  return <storeContext.Provider value={{ store }}>{children}</storeContext.Provider>;
};

export const useStores = () => useContext(storeContext);
```
<!--JavaScript-->

```jsx
import { useContext, createContext } from 'react';

import AppStore from './AppStore';

const storeContext = createContext({ store });

export const StoreProvider = ({ children }) => {
  return <storeContext.Provider value={{ store }}>{children}</storeContext.Provider>;
};

export const useStores = () => useContext(storeContext);
```

<!--END_DOCUSAURUS_CODE_TABS-->

## `withDatx` HOC
`withDatx` higher order component will take care of passing our store to the page so it could be used in via `useStores` hook and in `getInitialProps` (if you need server side rendered page) via extended context object.
<!--DOCUSAURUS_CODE_TABS-->
<!--TypeScript-->

```tsx
import { NextPage, NextPageContext } from 'next';
import App from 'next/app';
import React from 'react';

import { getOrInitializeStore } from '../../stores/getOrInitializeStore';
import { AppStore } from '../../stores/AppStore';
import { StoreProvider } from '../stores/utils/useStore';

interface IOptions {
  ssr: boolean;
}

export type PageContextWithStore = NextPageContext & { store: AppStore };

// Extend NextPage context with 'store' (which is of type AppStore)
export type NextPageWithDatx<P = {}, IP = P> = NextPage<P, IP> & {
  getInitialProps?: (ctx: PageContextWithStore) => Promise<IP>;
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
<!--JavaScript-->

```tsx
import App from 'next/app';
import React from 'react';

import { getOrInitializeStore } from '../../stores/getOrInitializeStore';
import { AppStore } from '../../stores/AppStore';
import { StoreProvider } from '../stores/utils/useStore';

export const withDatx = (PageComponent, options = { ssr: true }) => {
  const WithDatx = ({ initialMobxState, ...props }) => {
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
    WithDatx.getInitialProps = async (context) => {
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

<!--END_DOCUSAURUS_CODE_TABS-->


## Use your store

```tsx
import fetch from 'isomorphic-unfetch';

import {
  withDatx,
  useStores,
  NextPageWithDatx,
  PageContextWithStore,
} from '../components/HOC/withDatx';

import { Employee } from '../stores/models/Employee';

const DashboardPage: NextPageWithDatx = () => {
  const store = useStores();

  return (
    <div>
      <h1>Dashboard</h1>
      <div>
        Senior developers: {store?.seniors.length}
        <div className="seniors-wrapper">
          {store?.seniors.map((senior) => (
            <div key={senior.id} className="senior-card">
              <p>
                <strong>Name:</strong> {senior.employee_name}
              </p>
              <p>
                <strong>Age:</strong> {senior.employee_age}
              </p>
              <p>
                <strong>Salary:</strong> {senior.formattedSalary}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

DashboardPage.getInitialProps = async ({ store }: PageContextWithStore) => {
  const response = await fetch('http://dummy.restapiexample.com/api/v1/employees');
  const data: { status: string; data: Array<any> } = await response.json();

  store.add(data.data, Employee);

  return {};
};

export default withDatx(DashboardPage);

```