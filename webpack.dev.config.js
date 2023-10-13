const path = require('path');
const { createConfig } = require('@edx/frontend-build');

const config = createConfig('webpack-dev');

/**
 * Plugins can use 'CourseAuthoring' as an import alias for this app:
 */
config.resolve.alias.CourseAuthoring = path.resolve(__dirname, 'src/');

module.exports = config;
