const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('jest', {
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTest.js',
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
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
});
