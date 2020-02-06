---
id: basic-setup
title: Basic setup
---

## 1. Setting up your models
<!--DOCUSAURUS_CODE_TABS-->
<!--TypeScript-->

```typescript
// /models/index.ts
import { Model, prop } from 'datx';
import { computed } from 'mobx';


export class Dog extends Model {
  public static type = 'dog';

  @prop
  public breed!: string;

  @prop
  public name!: string;

  @computed
  public get greet() {
    return `Hey, I am ${this.name} the ${this.breed}.`;
  }
}

export class Person extends Model {
  public static type = 'person';

  @prop
  public id!: number;

  @prop
  public name!: string;

  @prop
  public age!: number;

  @computed
  public get greet() {
    return `Hey, I am ${this.breed} ${this.name}.`;
  }
}
```

<!--JavaScript-->

```js
// /models/index.js
import { Model, prop } from 'datx';
import { computed } from 'mobx';


class Dog extends Model {
  static type = 'dog';

  @prop breed;

  @prop name;

  @computed
  get greet() {
    return `Hey, I am ${this.breed} ${this.name}.`;
  }
}

export class Person extends Model {
  static type = 'person';
  
  @prop id;

  @prop name;
  
  @prop age;
  
  @computed
  get greet() {
    return `Hey, my name is ${this.name} and I'm ${this.age}.`;
  }
}
```

<!--END_DOCUSAURUS_CODE_TABS-->


## 2. Setting up your collection
<!--DOCUSAURUS_CODE_TABS-->
<!--TypeScript-->

```typescript
import { Collection } from 'datx';
import { computed } from 'mobx';

import { Person, Dog } from './models';

export default class Family extends Collection {
  public static types = [Person, Dog];

  @computed
  public get dogs() {
    return this.findAll(Dog);
  }

  @computed
  public get germanShepherds() {
    return this.dogs.filter(dog => dog.breed === 'German Shepherd');
  }

  @computed
  public get minors() {
    return this.findAll(Person).filter(person => person.age < 18)
  }
}
```

<!--JavaScript-->

```js
import { Collection } from 'datx';
import { computed } from 'mobx';

import { Person, Dog } from './models';

export default class Family extends Collection {
  static types = [Person, Dog];
  @computed
  get dogs() {
    return this.findAll(Dog);
  }

  @computed
  get germanShepherds() {
    return this.dogs.filter(dog => dog.breed === 'German Shepherd');
  }

  @computed
  get minors() {
    return this.findAll(Person).filter(person => person.age < 18)
  }
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

## 3. Use your collection

### Create new instance

```typescript
import FamilyCollection from './store/Family';

const family = new FamilyCollection();
```

### Add models

For more ways of adding models, you can check out [API Reference](../api-reference/collection#add) or [code examples](adding-models).

```typescript
import FamilyCollection from './store/Family';
import { Person, Dog } from './store/models';

const family = new FamilyCollection();

const john = family.add({
  name: 'John',
  age: 12,
  id: 1
}, Person);

const rex = family.add({
  name: 'Rex',
  breed: 'German Shepherd';
}, Dog);

const floki = family.add({
  name: 'Floki',
  breed: 'Labrador';
}, Dog);

console.log(john.greet); // Hey, my name is John and I'm 12.
console.log(rex.greet); // Hey, I am German Shepherd Rex.

```

### Finding models

```javascript

import FamilyCollection from './store/Family';
import { Person, Dog } from './store/models';

const family = new FamilyCollection();

const john = family.add({
  name: 'John',
  age: 12,
  id: 1
}, Person);

const rex = family.add({
  name: 'Rex',
  breed: 'German Shepherd';
}, Dog);

const floki = family.add({
  name: 'Floki',
  breed: 'Labrador';
}, Dog);

console.log(family.getAllModels()); // [Person, Dog, Dog]
console.log(family.dogs) // [Dog, Dog]
console.log(family.findOne(Person, 1)) // Person
```

### Deleting models

```javascript

import FamilyCollection from './store/Family';
import { Person, Dog } from './store/models';

const family = new FamilyCollection();

const john = family.add({
  name: 'John',
  age: 12,
  id: 1
}, Person);

const rex = family.add({
  name: 'Rex',
  breed: 'German Shepherd';
}, Dog);

const floki = family.add({
  name: 'Floki',
  breed: 'Labrador';
}, Dog);

console.log(family.removeAll(Dog))
console.log(family.dogs) // [];

console.log(family.removeOne(Person, 1));
console.log(family.findAll(Person)) // [];
```

