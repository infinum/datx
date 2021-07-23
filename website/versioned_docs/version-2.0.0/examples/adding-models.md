---
id: version-2.0.0-adding-models
title: Adding models
original_id: adding-models
---

## 1. Adding a new model instance

```ts
import AppStore from "../store/AppStore";
import { Person } from "../store/models/";

const store = new AppStore();

const john = new Person({ name: "John Doe", age: 24 });
const newPerson = store.add(John);

console.log(newPerson); // Person
```

## 2. Adding an array of model instaces

```ts
import AppStore from "../store/AppStore";
import { Person } from "../store/models/";

const store = new AppStore();

const andy = new Person({ name: "Andy Doe", age: 30 });
const personsArray = store.add([
  andy,
  new Person({ name: "Ana Doe", age: 22 })
]);

console.log(personsArray); // [Person, Person]
```

## 3. Adding a plain object

```ts
import AppStore from "../store/AppStore";
import { Person } from "../store/models/";

const store = new AppStore();

// Adding a model type as a string so datx could determine a new model
const alex = store.add(
  {
    name: "Alex Doe",
    age: 24
  },
  "person"
);

// Adding a model constructor so datx could determine a model type
const tin = store.add(
  {
    name: "Tin Doe",
    age: 27
  },
  Person
);

console.log(alex); // Person
console.log(tin); // Person
```

## 4. Adding an array of plain objects

> When adding an array of plain objects, all models should be of **same type** (Person or Dog in this case).

```ts
import AppStore from "../store/AppStore";
import { Person, Dog } from "../store/models/";

const store = new AppStore();

const personsArray = store.add(
  [
    {
      name: "Pamela",
      age: 22
    },
    {
      name: "Maria",
      age: 18
    }
  ],
  Person
);

const dogsArray = store.add(
  [
    { name: "Floki", breed: "German Shepherd" },
    { name: "Riki", breed: "Corgi" }
  ],
  Dog
);

console.log(personsArray); // [Person, Person]
console.log(dogsArray); // [Dog, Dog]
```
