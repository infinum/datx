import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import excludeDependenciesFromBundle from 'rollup-plugin-exclude-dependencies-from-bundle';

import pkg from './package.json';

export default [
  {
    input: './src/index.ts',
    output: [{ file: pkg.main, format: 'cjs' }],
    plugins: [
      resolve(),
      commonjs(),
      excludeDependenciesFromBundle(),
      typescript({
        typescript: require('typescript'),
        tslib: require('tslib'),
        tsconfig: './tsconfig.build.json',
        sourceMap: true,
      }),
      terser({
        toplevel: true,
        compress: {
          passes: 3,
        },
        output: {
          comments: false,
        },
      }),
    ],
    onwarn(warning, rollupWarn) {
      if (warning.code !== 'CIRCULAR_DEPENDENCY') {
        rollupWarn(warning);
      }
    },
  },
  {
    input: './src/index.ts',
    output: [{ file: pkg.module, format: 'es' }],
    plugins: [
      resolve(),
      commonjs(),
      excludeDependenciesFromBundle(),
      typescript({
        typescript: require('typescript'),
        tslib: require('tslib'),
        tsconfig: './tsconfig.build.json',
        sourceMap: true,
      }),
    ],
    onwarn(warning, rollupWarn) {
      if (warning.code !== 'CIRCULAR_DEPENDENCY') {
        rollupWarn(warning);
      }
    },
  },
];
