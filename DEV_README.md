# Project setup

1. Install lerna globally `yarn global add lerna`
2. Run `lerna bootstrap`
3. If you're getting errors for other datx package imports, also run `lerna run build` and `lerna link`

# Updating local dependencies

Example: If you have made a change in `@datx/utils` and need to use the new change in `@datx/core`, it should be enough to run `yarn build` in the `packages/utils` folder. If the editor doesn't detect the changes, you can try to cmd+click on the error (forcing the editor to reload the typings).

# Testing

To test a specific package, run `yarn test` in its folder. If you want to run all tests, you can run `lerna run test` in the root folder. This will run tests in one of the variants. Once you push the code to the repository, GHA will run tests on all variants (mobx version combinations).

# Publishing

1. `lerna publish`
