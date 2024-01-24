const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('jest', {
  roots: [
    '<rootDir>/src',
  ],
  setupFiles: [
    '<rootDir>/src/setupTest.js',
  ],
  modulePaths: ['<rootDir>/src/'],
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
});
