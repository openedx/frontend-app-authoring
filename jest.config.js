const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('jest', {
  setupFiles: [
    '<rootDir>/src/setupTest.js',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTestEnv.js',
  ],
  coveragePathIgnorePatterns: [
    'src/setupTestEnv.js',
    'src/setupTest.js',
    'jest.config.js',
    'src/i18n',
    '/node_modules/',
    '/specs/'
  ],
  snapshotSerializers: [
    'enzyme-to-json/serializer',
  ],
  collectCoverageFrom: [
    "**/*.{js,jsx}",
  ],
  testMatch: [
    '**/specs/**/*.spec.(js|jsx)|**/__tests__/*.(js|jsx)|**/specs/*.spec.(js|jsx)',
  ],
  roots: [
    '<rootDir>src/',
  ],
  coveragePathIgnorePatterns: [
    'src/setupTest.js',
    'jest.config.js',
    'src/i18n',
    '/node_modules/',
    '/specs/'
  ],
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
});
