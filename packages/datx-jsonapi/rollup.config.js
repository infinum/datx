import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

import pkg from './package.json';

export default [
  {
    input: './src/index.ts',
    output: [{ file: pkg.main, format: 'cjs' }],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        check: true,
        typescript: require('typescript'),
        tsconfig: './tsconfig.build.json',
      }),
      terser({ toplevel: true }),
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
      typescript({
        check: true,
        typescript: require('typescript'),
        tsconfig: './tsconfig.build.json',
      }),
    ],
    onwarn(warning, rollupWarn) {
      if (warning.code !== 'CIRCULAR_DEPENDENCY') {
        rollupWarn(warning);
      }
    },
  },
];
