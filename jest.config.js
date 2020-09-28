const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('jest', {
  setupFiles: [
    '<rootDir>/src/setupTest.js',
  ],
  collectCoverageFrom: [
    "**/*.{js,jsx}",
  ],
  testMatch: [
    '**/specs/**/*.spec.(js|jsx)|**/__tests__/*.(js|jsx)',
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
});
