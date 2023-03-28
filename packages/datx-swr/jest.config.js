module.exports = {
  testEnvironment: 'jsdom',
  testRegex: '/test/.*\\.test\\.tsx?$',
  modulePathIgnorePatterns: ['<rootDir>/examples/', 'packages/.*/dist'],
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
    '^@datx/utils': '<rootDir>/../datx-utils/src/',
    '^@datx/jsonapi': '<rootDir>/../datx-jsonapi/src/',
  },
  automock: false,
  resetMocks: false,
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
};
