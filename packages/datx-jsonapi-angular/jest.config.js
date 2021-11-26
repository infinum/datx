module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['./setup-jest.ts'],
  coveragePathIgnorePatterns: ['/test/', '/node_modules/', '(.*).testing.(.*)$'],
  moduleFileExtensions: ['ts', 'js'],
  testEnvironment: 'jsdom',
  testRegex: ['test/(.*).test.ts$', 'src/(.*).spec.ts$'],
  testMatch: null,
  collectCoverage: true,
  collectCoverageFrom: ['projects/datx-jsonapi-angular/src/**/*.ts'],
  globals: {
    'ts-jest': {
      tsconfig: './projects/datx-jsonapi-angular/tsconfig.spec.json',
    },
  },
};
