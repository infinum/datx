/**
 * Copyright 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
// Based on https://github.com/reactjs/react-codemod/blob/dd8671c9a470a2c342b221ec903c574cf31e9f57/bin/cli.js
// @datx/codemod optional-name-of-transform optional/path/to/src [...options]

import globby from 'globby';
import inquirer from 'inquirer';
import meow from 'meow';
import type { Options, AnyFlags } from 'meow';
import path from 'path';
import execa from 'execa';
import chalk from 'chalk';
import isGitClean from 'is-git-clean';

export const jscodeshiftExecutable = require.resolve('.bin/jscodeshift');

export const transformerDirectory = path.join(__dirname, '../', 'transforms');

export function checkGitStatus(force) {
  let clean = false;
  let errorMessage = 'Unable to determine if git directory is clean';

  try {
    clean = isGitClean.sync(process.cwd());
    errorMessage = 'Git directory is not clean';
  } catch (err) {
    if (err && err.stderr && err.stderr.indexOf('Not a git repository') >= 0) {
      clean = true;
    }
  }

  if (!clean) {
    if (force) {
      console.log(`WARNING: ${errorMessage}. Forcibly continuing.`);
    } else {
      console.log('Thank you for using @datx/codemod!');
      console.log(
        chalk.yellow('\nBut before we continue, please stash or commit your git changes.'),
      );
      console.log('\nYou may use the --force flag to override this safety check.');
      process.exit(1);
    }
  }
}

export function runTransform({ files, flags, transformer }) {
  const transformerPath = path.join(transformerDirectory, `${transformer}.js`);

  let args: Array<string> = [];

  const { dry, print, runInBand } = flags;

  if (dry) {
    args.push('--dry');
  }

  if (print) {
    args.push('--print');
  }

  if (runInBand) {
    args.push('--run-in-band');
  }

  args.push('--verbose=2');

  args.push('--ignore-pattern=**/node_modules/**');
  args.push('--ignore-pattern=**/.next/**');

  args.push('--extensions=tsx,ts,jsx,js');

  args = args.concat(['--transform', transformerPath]);

  if (flags.jscodeshift) {
    args = args.concat(flags.jscodeshift);
  }

  args = args.concat(files);

  console.log(`Executing command: jscodeshift ${args.join(' ')}`);

  const result = execa.sync(jscodeshiftExecutable, args, {
    stdio: 'inherit',
    stripFinalNewline: false,
  });

  if (result.failed) {
    throw new Error(`jscodeshift exited with code ${result.exitCode}`);
  }
}

const TRANSFORMER_INQUIRER_CHOICES = [
  {
    name: 'prop-to-attribute: Transforms `@prop` decorator into `@Attribute`',
    value: 'prop-to-attribute',
  },
  {
    name: 'scoped-package-name: The packages are now scoped under `@datx` and the `datx` prefix is deprecated',
    value: 'scoped-package-name',
  },
  {
    name: 'jsonapi-i-request-options-changes: Migration to new IRequestOptions interface',
    value: 'jsonapi-i-request-options-changes',
  },
  {
    // eslint-disable-next-line max-len
    name: 'jsonapi-pagination: The pagination is now using methods instead of just plain property access: await response.next becomes await response.next()',
    value: 'jsonapi-pagination',
  },
  {
    name: 'attribute-to-field: In DatX 3.0.0, the `@Attribute` decorator is renamed to `@Field`',
    value: 'attribute-to-field',
  },
];

function expandFilePathsIfNeeded(filesBeforeExpansion) {
  const shouldExpandFiles = filesBeforeExpansion.some((file) => file.includes('*'));

  return shouldExpandFiles ? globby.sync(filesBeforeExpansion) : filesBeforeExpansion;
}

export function run() {
  const cli = meow({
    description: 'Codemods for updating Datx apps.',
    help: `
    Usage
      $ npx @datx/codemod <transform> <path> <...options>
        transform    One of the choices from https://datx.dev/docs/migration-guide/codemods
        path         Files or directory to transform. Can be a glob like pages/**.js
    Options
      --force            Bypass Git safety checks and forcibly run codemods
      --dry              Dry run (no changes are made to files)
      --print            Print transformed files to your terminal
      --jscodeshift  (Advanced) Pass options directly to jscodeshift
    `,
    flags: {
      boolean: ['force', 'dry', 'print', 'help'],
      string: ['_'],
      alias: {
        h: 'help',
      },
    } as AnyFlags,
  } as Options<AnyFlags>);

  if (!cli.flags.dry) {
    checkGitStatus(cli.flags.force);
  }

  if (cli.input[0] && !TRANSFORMER_INQUIRER_CHOICES.find((x) => x.value === cli.input[0])) {
    console.error('Invalid transform choice, pick one of:');
    console.error(TRANSFORMER_INQUIRER_CHOICES.map((x) => '- ' + x.value).join('\n'));
    process.exit(1);
  }

  inquirer
    .prompt([
      {
        type: 'input',
        name: 'files',
        message: 'On which files or directory should the codemods be applied?',
        when: !cli.input[1],
        default: '.',
        // validate: () =>
        filter: (files) => files.trim(),
      },
      {
        type: 'list',
        name: 'transformer',
        message: 'Which transform would you like to apply?',
        when: !cli.input[0],
        pageSize: TRANSFORMER_INQUIRER_CHOICES.length,
        choices: TRANSFORMER_INQUIRER_CHOICES,
      },
    ])
    .then((answers) => {
      const { files, transformer } = answers;

      const filesBeforeExpansion = cli.input[1] || files;
      const filesExpanded = expandFilePathsIfNeeded([filesBeforeExpansion]);

      const selectedTransformer = cli.input[0] || transformer;

      if (!filesExpanded.length) {
        console.log(`No files found matching ${filesBeforeExpansion.join(' ')}`);

        return null;
      }

      return runTransform({
        files: filesExpanded,
        flags: cli.flags,
        transformer: selectedTransformer,
      });
    });
}
