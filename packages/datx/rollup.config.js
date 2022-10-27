const typescript = require('@rollup/plugin-typescript');
const { terser } = require('rollup-plugin-terser');
// const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
// const excludeDependenciesFromBundle = require('rollup-plugin-exclude-dependencies-from-bundle');

const pkg = require('./package.json');

const resolvePlugin = resolve();

const typescriptPlugin = typescript({
  typescript: require('typescript'),
  tslib: require('tslib'),
  tsconfig: './tsconfig.build.json',
  sourceMap: true,
});

const terserPlugin = terser({
  toplevel: true,
  compress: { passes: 3 },
  output: { comments: false },
});

export default [
  {
    input: './src/index.ts',
    output: [{ file: pkg.main, format: 'cjs', sourcemap: true }],
    plugins: [
      resolvePlugin,
      // commonjs(),
      // excludeDependenciesFromBundle(),
      typescriptPlugin,
      terserPlugin,
    ],
    // onwarn(warning, rollupWarn) {
    //   if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    //     rollupWarn(warning);
    //   }
    // },
  },
  {
    input: './src/index.ts',
    output: [{ file: pkg.module, format: 'es', sourcemap: true }],
    plugins: [
      resolvePlugin,
      // commonjs(),
      // excludeDependenciesFromBundle(),
      typescriptPlugin,
    ],
    // onwarn(warning, rollupWarn) {
    //   if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    //     rollupWarn(warning);
    //   }
    // },
  },
  {
    input: './src/min.ts',
    output: [{ file: 'min/cjs.js', format: 'cjs', sourcemap: true }],
    plugins: [
      resolvePlugin,
      // commonjs(),
      // excludeDependenciesFromBundle(),
      typescriptPlugin,
      terserPlugin,
    ],
    // onwarn(warning, rollupWarn) {
    //   if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    //     rollupWarn(warning);
    //   }
    // },
  },
  {
    input: './src/min.ts',
    output: [{ file: 'min/esm.js', format: 'es', sourcemap: true }],
    plugins: [
      resolvePlugin,
      // commonjs(),
      // excludeDependenciesFromBundle(),
      typescriptPlugin,
    ],
    // onwarn(warning, rollupWarn) {
    //   if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    //     rollupWarn(warning);
    //   }
    // },
  },
];
