const path = require('path');
const { createConfig } = require('@edx/frontend-build');

const config = createConfig('webpack-prod', {
  resolve: {
    alias: {
      // Plugins can use 'CourseAuthoring' as an import alias for this app:
      CourseAuthoring: path.resolve(__dirname, 'src/'),
    },
    fallback: {
      fs: false,
      constants: false,
    },
  },
});

module.exports = config;
