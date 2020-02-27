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

