---
id: pure-model
title: Pure Model
---

`PureModel` is a model without any metadata or methods on itself. The goal is to have a model that is as close to the Plain JavaScript Object as possible.

To get additional functionality, you can either use [model utils](../api-reference/model-utils), enhance the model with mixins, or use the [`Model`](../api-reference/model).

`PureModel` doesn't have any dynamic properties or methods, but has some static ones:

- `static type: IType` - The model type
- `static autoIdValue: IIdentifier` - The starting id if auto ID is enabled (default is `0`)
- `static enableAutoId: boolean` - Should the auto ID be generated if no ID is provided (default is `true`)
- `static getAutoId(): IIdentifier` - Returns the next auto ID. Default behaviour is to decrease the `autoIdValue` by one each time (first model has id `-1`, the second one `-2`, etc.)
- `static toJSON(): IType` - Returns the model type - used for serialisation of the model
- `static preprocess(data: object): object` - Function used to preprocess the data before the model is initialised. By default it doesn't do anything.
- `constructor(rawData: IRawModel = {}, collection?: Collection)` - Constructor of the model. The first argument is a raw model or an object with the data that should be added to the new model. The second (optional) argument is a collection instance if the model should be added to it.
