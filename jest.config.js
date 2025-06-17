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
    // This alias is for any code in the src directory that wants to avoid '../../' style relative imports:
    '^@src/(.*)$': '<rootDir>/src/$1',
    // This alias is used for plugins in the plugins/ folder only.
    '^CourseAuthoring/(.*)$': '<rootDir>/src/$1',
  },
  modulePathIgnorePatterns: [
  ],
});
