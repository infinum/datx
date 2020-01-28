---
id: prop
title: Prop
---

The `prop` decorator util is used to define the properties of the model. If needed, multiple prop decorators can be used on the same property.

For usage examples check out the [defining models guide](Defining-models).

It supports the following methods:

## prop

Just a regular property without any default value

```typescript
  @prop
  public name: string;
```

## prop.identifier

Defines the ID attribute of the model. If the decorator is not used on a model, the default ID attribute will be `id`.

```typescript
  @prop.identifier
  public key: number;
```

## prop.type

Defines the type attribute of the model. If not used, the type will default to the static type property. This decorator is mostly for internal use and dynamic model types.

```typescript
  @prop.type
  public type: string;
```

## prop.defaultValue

Used to set a default value of the property.

**Note:** This needs to be used instead of property assignment. Because of the execution order, property assignment will also override the initial values when creating a model.

```typescript
  @prop.defaultValue(true)
  public favorite: boolean;
```

## prop.toOne

Used to define a reference to one model. Note: The value can also be undefined.

```typescript
  @prop.toOne(Person)
  public spouse?: Person;
```

## prop.toMany

Used to define a reference to multiple models. This decorator is useful because it supports [indirect reference](references#indirect-references) (the second argument).

```typescript
  @prop.toMany(Person, 'owner')
  public children: Array<Person>;
```

## prop.toOneOrMany

Defines a relationship to a single or multiple models. The value can also be undefined.

```typescript
  @prop.toOneOrMany(Pet)
  public pets?: Pet|Array<Pet>;
```

## Using `prop` without decorators

[In some cases](https://github.com/infinum/datx/issues/92), you might not be able to use the `@prop` decorator, but you can still use it as a function. The function has two arguments: the class you're decorating and name of the property you're decorating. You can find the example in the [defining models](https://github.com/infinum/datx/wiki/Defining-models#option-1) section.
