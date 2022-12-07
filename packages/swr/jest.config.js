module.exports = {
  testEnvironment: 'jsdom',
  testRegex: '/test/.*\\.test\\.tsx?$',
  modulePathIgnorePatterns: ['<rootDir>/examples/'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc-node/jest',
      {
        jsc: {
          minify: false,
        },
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    ],
  },
  moduleNameMapper: {
    '^@datx/swr': '<rootDir>/src',
  },
  automock: false,
  resetMocks: false,
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
};
