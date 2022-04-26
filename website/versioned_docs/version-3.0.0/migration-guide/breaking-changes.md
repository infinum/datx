---
id: version-3.0.0-breaking-changes
title: Breaking changes since v2
original_id: breaking-changes
---

## Removed MobX dependency

### If you used MobX in v2

This is a significant change. If you're already using MobX in your application, you should keep the v2 version as the feature parity will be kept for some time.

Breaking changes:

- Models are no longer observable
- Reference arrays need to be immutable - this means that the array items can't be replaced, added or removed without creating a new array and assigning it to the reference.

### If you didn't use MobX in v2

The migration only requires removal of the `@datx/core/disable-mobx` include. Optionally, you can also remove any build configuration that handled mocking the `mobx` package.
