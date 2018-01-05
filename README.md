# datx

A MobX data store

The store meant to replace [mobx-collection-store](https://github.com/infinum/mobx-collection-store). Coming soon...

***

[![Build Status](https://travis-ci.org/infinum/datx.svg?branch=master)](https://travis-ci.org/infinum/datx)
[![npm version](https://badge.fury.io/js/datx.svg)](https://badge.fury.io/js/datx)

[![Dependency Status](https://david-dm.org/infinum/datx.svg?path=packages/datx)](https://david-dm.org/infinum/datx?path=packages/datx)
[![devDependency Status](https://david-dm.org/infinum/datx/dev-status.svg?path=packages/datx)](https://david-dm.org/infinum/datx?path=packages/datx#info=devDependencies)

## Basic usage

**todo**

## Getting started

**todo**

## API reference

**todo**

## Mixins

**todo**

## TODO

### To match mobx-collection-store v2 feature set

* [ ] Snapshots/patches
  * patchListen
  * applyPatch
  * snapshot
* [x] Reference
* [x] Back reference
* [x] idAttribute
* [x] typeAttribute
* [x] Support for id updating
* [x] Destroy collection
* [x] Reset collection
* [x] Defining models without decorators

### Dev mode

* [ ] Dev mode flag
* [ ] Error when assigning properties directly (with ES6 proxy)
* [ ] Warning mechanism
  * [ ] Warn if back reference correctness can't be ensured
  * [ ] Deprecation warnings (future)

### New features

* [x] Mixin support
  * [x] Meta mixin
  * [x] Actions mixin
* [x] Model in multiple collections

### V1 features

* [ ] Usage documentation
* [x] Code documentation

## License

The [MIT License](LICENSE)

## Credits

datx is maintained and sponsored by
[Infinum](http://www.infinum.co).

<img src="https://infinum.co/infinum.png" width="264">
