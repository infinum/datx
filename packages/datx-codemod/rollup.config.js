import typescript from '@rollup/plugin-typescript';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import copy from 'rollup-plugin-copy';
import shebang from 'rollup-plugin-add-shebang';
// import { nodeResolve } from '@rollup/plugin-node-resolve';

import pkg from './package.json';

export default [
  {
    input: 'src/bin/datx-codemod.ts',
    output: {
      dir: 'dist',
      format: 'cjs',
      sourcemap: false,
    },
    plugins: [
      typescript({
        typescript: require('typescript'),
        tslib: require('tslib'),
        tsconfig: './tsconfig.build.json',
        sourceMap: false,
      }),
      shebang({
        include: pkg.bin,
      }),
      generatePackageJson({
        outputFolder: 'dist',
        baseContents: (pack) => ({
          ...pack,
          bin: './bin/datx-codemod.js',
          jest: undefined,
          scripts: undefined,
          devDependencies: {},
          husky: undefined,
        }),
      }),
      copy({
        targets: [{ src: 'README.md', dest: 'dist' }],
      }),
      copy({
        targets: [{ src: 'LICENSE', dest: 'dist' }],
      }),
    ],
    onwarn(warning, rollupWarn) {
      if (warning.code !== 'CIRCULAR_DEPENDENCY') {
        rollupWarn(warning);
      }
    },
  },
];
