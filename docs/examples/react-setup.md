---
id: react-setup
title: React setup
---

## Getting started

Steps:

- [Setup your collection and models](./basic-setup)
- [Create `<StoreProvider>` that will wrap initial `<App />` component](./react-setup#storeprovider)
- [Create `useStores` hook](./react-setup#usestores-hook)
- [Use your store in component](./react-setup#use-your-store)

## `StoreProvider`

Store provider is nothing but a [react context provider](https://reactjs.org/docs/context.html#contextprovider) that will hold our initialized store instances.

Inside our store folder, along with models and collection(s), we will create a `StoreContext` file with store context setup.

<!--DOCUSAURUS_CODE_TABS-->
<!--TypeScript-->

```tsx
// store/StoreProvider.tsx

import { createContext, ReactNode } from 'react';

import AppStore from './AppStore';

export interface IStores {
  store: AppStore;
}

interface IProviderProps {
  children: ReactNode;
}

const storeContext = createContext<IStores>({ store });

export const StoreProvider = ({ children }: IProviderProps) => {
  return <storeContext.Provider value={{ store }}>{children}</storeContext.Provider>;
};
```

<!--JavaScript-->

```jsx
// store/StoreProvider.jsx

import { createContext } from 'react';

import AppStore from './AppStore';

export const storeContext = createContext({ store });

export const StoreProvider = ({ children }) => {
  return <storeContext.Provider value={{ store }}>{children}</storeContext.Provider>;
};
```

<!--END_DOCUSAURUS_CODE_TABS-->

## `useStores` hook

Our `useStores` hook will get access to the `storeContext` via [useContext](https://reactjs.org/docs/hooks-reference.html#usecontext) hook and give us an object of our stores we added as value to our `<StoreProvider>`.

```js
// /hooks/useStores.ts

import { useContext } from 'react';

import { storeContext } from '../store/StoreProvider.tsx';

export const useStores = () => useContext(storeContext);
```

## Use your store

In this section, we will setup our app with `StoreProvider` and use our store in our component with `useStores` hook.

### Setup your app

```jsx
// /index.tsx (or jsx)

import React from 'react';
import { render } from 'react-dom';

import { App } from './App';
import { StoreProvider } from './store/StoreContext';

const rootElement = document.getElementById('root');
render(
  <StoreProvider>
    <App />
  </StoreProvider>,
  rootElement,
);
```

Now, our `<App>` component has access to the `storeContext` via `useStores` hook. (Since useStores hook returns a `useContext()` hook with `storeContext` as its parameter)

### Use store inside wrapped component

```jsx
// components/App.tsx (or jsx)

import React from 'react';

import { useStore } from './store/StoreContext';
import { Book } from './store/models/Book';

import './styles.css';

export const App = () => {
  const { store } = useStore();
  const books = store.findAll(Book);

  return (
    <div className="App">
      <h1>Your books: {books.length}</h1> // 2
    </div>
  );
};
```

## Related

<div class="docs-card">
  <a href="/docs/examples/basic-setup">
    <h4>Basic setup</h4>
    <small>Setup your datx store and models</small>
  </a>
</div>
<div class="docs-card">
  <a href="/docs/examples/adding-models">
    <h4>Adding models</h4>
    <small>Learn the different ways of adding models to your store</small>
  </a>
</div>
