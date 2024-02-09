const path = require('path');
const { createConfig } = require('@openedx/frontend-build');

module.exports = createConfig('webpack-dev', {
  entry: path.resolve(__dirname, 'src'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  resolve: {
    modules: [
      path.resolve(__dirname, './src'),
      'node_modules',
    ],
    alias: {
      '@edx/frontend-lib-content-components': path.resolve(__dirname, 'src'),
    },
  },
});
