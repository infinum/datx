# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or any other method with the owners of this repository before making a change.

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a
   build.
2. Update the README.md with details of changes to the interface, this includes new environment
   variables, exposed ports, useful file locations and container parameters.
3. Increase the version numbers in any examples files and the README.md to the new version that this
   Pull Request would represent. The versioning scheme we use is [SemVer](https://semver.org/).
4. You may merge the Pull Request in once you have the sign-off of two other developers, or if you
   do not have permission to do that, you may request the second reviewer to merge it for you.

## Project setup

1. Install lerna globally `npm install --location=global lerna`
2. Run `yarn` in the root folder to install all dependencies
3. Run `lerna run build` and `lerna link`

## Updating local dependencies

Example: If you have made a change in `@datx/utils` and need to use the new change in `@datx/core`, it should be enough to run `yarn build` in the `datx-utils` folder. If the editor doesn't detect the changes, you can try to cmd+click on the error (forcing the editor to reload the typings).

## Testing

To test a specific package, run `yarn test` in its folder. If you want to run all tests, you can run `lerna run test` in the root folder. This will run tests in one of the variants. Once you push the code to the repository, GHA will run tests on all variants.

## Writing docs

When writing docs, make sure your updates are writtern in `versioned_docs/{version}` and `versioned_sidebars/{version}` to be visible once docs are generated and published. Otherwise, only `next` version on the docs website will be updated and published.

## Publishing

1. `lerna publish`
