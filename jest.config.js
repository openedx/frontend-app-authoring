const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('jest', {
  setupFiles: [
    '<rootDir>/src/setupTest.js',
  ],
  modulePaths: ['<rootDir>/src/'],
  snapshotSerializers: [
    'enzyme-to-json/serializer',
  ],
});
