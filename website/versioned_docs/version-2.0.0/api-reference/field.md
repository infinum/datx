---
id: version-2.0.0-field
title: Field
original_id: field
---

The `Field` decorator is used to define the properties of the model.

For usage examples check out the [defining models guide](../getting-started/defining-models).

It supports the following methods:

## Field

Just a regular property without any default value

```typescript
  @Field()
  public name: string;
```

## Field({ isIdentifier: true })

Defines the ID field of the model. If the decorator is not used on a model, the default ID field will be `id`.

```typescript
  @Field({ isIdentifier: true })
  public key: number;
```

## Field({ isType: true })

Defines the type field of the model. If not used, the type will default to the static type property. This decorator is mostly for internal use and dynamic model types.

```typescript
  @Field({ isType: true })
  public type: string;
```

## Field({ defaultValue: value })

Used to set a default value of the property.

**Note:** This needs to be used instead of property assignment. Because of the execution order, property assignment will also override the initial values when creating a model.

```typescript
  @Field({ defaultValue: true })
  public favorite: boolean;
```

## Field({ toOne: Model })

Used to define a reference to one model. Note: The value can also be undefined.

```typescript
  @Field({ toOne: Person })
  public spouse?: Person;
```

## Field({ toMany: Model })

Used to define a reference to multiple models. This decorator is also useful because it supports [indirect reference](references#indirect-references) (the `referenceProperty` argument).

```typescript
  @Field({ toMany: Person, referenceProperty: 'owner' })
  public children: Array<Person>;
```

## Field({ toOneOrMany: Model })

Defines a relationship to a single or multiple models. The value can also be undefined.

```typescript
  @Field({ toOneOrMany: Pet })
  public pets?: Pet|Array<Pet>;
```

## Polymorphic relationships

DatX v1 had a limitation where a relationship on the model could only hold references to one model type. This limitation was removed in v2. When you define the reference by using the `@Field` decorator, you can either define the default type (another one will be used if another model type instance is passed) or you can define a function. If you define a function, it will receive multiple arguments (data, parentModel, kay, collection) and it needs to decide which type should be used.

```typescript
export type FunctionRefModel = (
  data: object, // The data that will be used to create a new model
  parentModel: PureModel, // The model instance which initialized the creation
  key: string, // The key in the parent model where the reference will be saved
  collection?: PureCollection, // The collection the parent model bellongs to
) => typeof PureModel | IType;

// The reference options can be either a default model type or a function
export type RefModel = typeof PureModel | IType | FunctionRefModel;
```

Example:

```typescript
@Field({ toOne: (data) => data.type === 'person' ? Person : Pet })
```

## Parsers & serializers

Sometimes, you'll need to map your data in a way that might not be compatible with your API (or maybe for some other reason specific to your use case). This could range from renaming properties to converting them to other types (e.g. from a date string to a date object). This is where parsers and serializers can be used. The functions are passed as options to the `@Field` decorator.

### map

The map property maps a single property from the input object to the model (before the parse call) and back (after the serialize call).

Example:

```typescript
@Field({ map: 'first_name' })
public firstName: string;
```

### parse

The parse function rceives the raw value (first argument is the eact property and the second value is the whole model). It should return the value which should be used to initialize the model.

```typescript
parse?: (value: any, data: object) => any;
```

Examples:

```typescript
// Change the type
@Field({ parse: (value: string) => new Date(value) })
public createdAt: Date;

// Rename the property
@Field({ parse: (value: any, data: object) => data.created_by })
public createdBy: string;

```

## Compound IDs

Altrough there is no out-of-the-box solution for compound IDs in DatX, it is easy to achieve them using the `Field` features defined above:

```typescript
@Field({
  // Set it as an identifier
  isIdentifier: true,
  // Combine two (userId, companyId) IDs into a single compound ID
  parse: (_: never, data: Record<string, string>) => `${data.userId}-${data.companyId}`
})
public id: string;
```

## Using `Field` without decorators

[In some cases](https://github.com/infinum/datx/issues/92), you might not be able to use the `@Field()` decorator, but you can still use it as a function. The function has two arguments: the class you're decorating and name of the property you're decorating. You can find the example in the [defining models](../getting-started/defining-models) section.
