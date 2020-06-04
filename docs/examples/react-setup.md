---
id: react-setup
title: React setup
---

## Preface

This examples uses the `react-mobx ^6.x` since we will be only using functional components with [hooks](https://reactjs.org/docs/hooks-intro.html).

If your codebase does not support hooks, you can check out [mobx-react docs](https://mobx-react.js.org/libraries) for more info.

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

In this section, we will show you a couple different ways of observing your store changes in your components, and differences between them.

- Using `observer` HOC
- Using `<Observer>` component
- Using `useObserver` hook

But first, we will setup our app with `StoreProvider` and use our store in our component with `useStores` hook.

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

### Using `observer` HOC

When wrapping your component in `observer` HOC, the component will become reactive and will re-render every time when a observable changes (e.g. you remove a model from a store).

> Quick note: Since we don't use [legacy context](https://reactjs.org/docs/legacy-context.html), you don't have to worry about the warning described on [mobx-react docs](https://mobx-react.js.org/observer-hoc)

```jsx
// components/App.tsx (or jsx)

import React from 'react';
import { observer } from 'mobx-react';

import { useStore } from './store/StoreContext';
import { Book } from './store/models/Book';

import './styles.css';

export const App = observer(() => {
  const { store } = useStore();

  const handleRemoveBook = (bookId) => {
    return () => {
      store.removeOne(Book, bookId);
    };
  };

  console.log(store.getAllModels()); // 4 -> 3

  return (
    <div className="App">
      <h1>Your books: {store.books.length}</h1>
      <ul>
        {store.books.map((book) => (
          <li key={book.id}>
            <h4>
              {book.title} <button onClick={handleRemoveBook(book.id)}>X</button>
            </h4>
            <small>by {book.author.name}</small>
          </li>
        ))}
      </ul>
    </div>
  );
});
```

### Using `useObserver` hook

Here, we use `useObserver` hook to return our jsx element when observable change. Despite using it in the middle of our component, our entire component will be re-rendered on observable change.

Read more on [mobx-react](https://mobx-react.js.org/observer-hook) docs.

```jsx
// components/App.tsx (or jsx)

import React from 'react';
import { useObserver } from 'mobx-react';

import { useStore } from './store/StoreContext';
import { Book } from './store/models/Book';

import './styles.css';

export const App = () => {
  const { store } = useStore();

  const handleRemoveBook = (bookId) => {
    return () => {
      store.removeOne(Book, bookId);
    };
  };

  console.log(store.getAllModels()); // 4 -> 3

  return useObserver(() => (
    <div className="App">
      <h1>Your books: {store.books.length}</h1>
      <ul>
        {store.books.map((book) => (
          <li key={book.id}>
            <h4>
              {book.title} <button onClick={handleRemoveBook(book.id)}>X</button>
            </h4>
            <small>by {book.author.name}</small>
          </li>
        ))}
      </ul>
    </div>
  ));
};
```

### Using `<Observer>` component

When using the Observer component, only a portion of code will be updated on observable change. It is a good approach if you have a large component and you want to update just a specific part(s) that needs to listen to changes.

> Since observer can see observables only within its own render function, nesting another component with render prop will prevent Observer to observe changes. Check out [mobx-react docs](https://mobx-react.js.org/observer-component#nesting-caveat) for more information.

```jsx
// components/App.tsx (or jsx)

import React from 'react';
import { useObserver } from 'mobx-react';

import { useStore } from './store/StoreContext';
import { Book } from './store/models/Book';

import './styles.css';

export const App = () => {
  const { store } = useStore();

  const handleRemoveBook = (bookId) => {
    return () => {
      store.removeOne(Book, bookId);
    };
  };

  console.log(store.getAllModels()); // Always 4

  return () => (
    <div className="App">
      <h1>Your books: {store.books.length}</h1> {/** Oops, this will stay 2 */}
      <Observer>
        {() => (
          <ul>
            {store.books.map((book) => (
              <li key={book.id}>
                <h4>
                  {book.title} <button onClick={handleRemoveBook(book.id)}>X</button>
                </h4>
                <small>by {book.author.name}</small>
              </li>
            ))}
          </ul>
        )}
      </Observer>
    </div>
  );
};
```

---

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
