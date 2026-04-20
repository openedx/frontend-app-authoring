const { createConfig } = require('@openedx/frontend-build');

const mergedConfig = createConfig('jest', {
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
  modulePathIgnorePatterns: [],
});

// Override ts-jest config: When transforming .ts files to .js for test purposes,
// don't report TypeScript errors for files in `node_modules/` (or any non-test files).
// Without this, we were seeing TypeScript errors from
//   node_modules/@edx/frontend-component-header/dist/studio-header/StudioHeader.tsx
// cause the tests to fail, because they are included in `transformIgnorePatterns`.
// -> If you can delete the following lines and the tests still pass, then feel free
//    to remove this whole override. It's only necessary now while StudioHeader has some
//    typing issues.
mergedConfig.transform['^.+\\.[tj]sx?$'] = [
  'ts-jest',
  {
    diagnostics: {
      exclude: ['!**/*.test.*'],
    },
  },
];

module.exports = mergedConfig;
