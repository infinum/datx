import typescript from 'rollup-plugin-typescript2';
import uglify from 'rollup-plugin-uglify';

export default {
  input: './src/index.ts',
  output: {
    file: './dist/index.js',
    format: 'umd',
    name: 'datx-jsonapi',
  },

  plugins: [
    typescript({
      check: true,
      typescript: require('typescript'),
      tsconfig: './tsconfig.build.json',
    }),
    uglify(),
  ]
}
