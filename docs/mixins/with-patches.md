---
id: with-patches
title: withPatches
---

`withPatches` is a mixin that exposes patch mechanism on Models and Collections. When applied, it will expose three metthods on a model or collection:

* `applyPatch(patch: IPatch): void` - Apply a patch definition
* `undoPatch(patch: IPatch): void` - Undo a patch
* `onPatch(callbackFn: (patch: IPatch) => void): () => void` - Subscribe to patches. The method returns an unsubscribe function.

```typescript

import {PatchType} from '../enums/PatchType';
import {PureModel} from '../PureModel';
import {IIdentifier} from './IIdentifier';
import {IType} from './IType';

export interface IPatch<T = PureModel> {
  patchType: PatchType;
  model: {
    type: IType;
    id: IIdentifier;
  };
  oldValue?: Partial<T>;
  newValue?: Partial<T>;
}
```

The mixin is already applied to the [`Model`](../api-reference/model) and [`Collection`](../api-reference/collection), but can also be applied to [`PureModel`](../api-reference/pure-model) if needed.