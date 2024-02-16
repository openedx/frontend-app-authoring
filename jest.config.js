const { createConfig } = require('@openedx/frontend-build');

module.exports = createConfig('jest', {
  setupFilesAfterEnv: [
    'jest-expect-message',
    '<rootDir>/src/setupTest.js',
  ],
  coveragePathIgnorePatterns: [
    'src/setupTest.js',
    'src/i18n',
  ],
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
    '^CourseAuthoring/(.*)$': '<rootDir>/src/$1',
  },
  modulePathIgnorePatterns: [
    '/src/pages-and-resources/utils.test.jsx',
  ],
});
