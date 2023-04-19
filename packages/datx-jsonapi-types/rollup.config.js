import typescript from '@rollup/plugin-typescript';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import dts from 'rollup-plugin-dts';

// import pkg from './package.json';

export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: 'dist/index.d.ts',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({
        typescript: require('typescript'),
        tslib: require('tslib'),
        tsconfig: './tsconfig.build.json',
      }),
      dts(),
      generatePackageJson({
        outputFolder: 'dist',
        baseContents: (pack) => ({
          ...pack,
          typings: './index.d.ts',
          jest: undefined,
          scripts: undefined,
          devDependencies: {},
          husky: undefined,
        }),
      }),
    ],
    onwarn(warning, rollupWarn) {
      if (warning.code !== 'CIRCULAR_DEPENDENCY') {
        rollupWarn(warning);
      }
    },
  },
];
