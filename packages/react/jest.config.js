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
  automock: false,
  resetMocks: false,
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/test/'],
  coverageProvider: 'v8',
  coverageReporters: ['text'],
};
