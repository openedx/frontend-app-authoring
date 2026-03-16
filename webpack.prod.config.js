const path = require('path');
const { createConfig } = require('@openedx/frontend-build');
// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require('webpack');

const config = createConfig('webpack-prod', {
  resolve: {
    alias: {
      // Within this app, we can use '@src/foo instead of relative URLs like '../../../foo'
      '@src': path.resolve(__dirname, 'src/'),
      // Plugins can use 'CourseAuthoring' as an import alias for this app:
      CourseAuthoring: path.resolve(__dirname, 'src/'),
    },
    fallback: {
      fs: false,
      constants: false,
    },
  },
  // Silently ignore “module not found” errors for that exact specifier.
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /@edx\/frontend-plugin-notifications/,
      (resource) => {
        try {
          // Try to resolve the real package. If it exists, do nothing.
          require.resolve('@edx/frontend-plugin-notifications');
        } catch (e) {
          // Package not found → point to the stub we created.
          // eslint-disable-next-line no-param-reassign
          resource.request = path.resolve(__dirname, 'src/stubs/empty-notifications-plugin.tsx');
        }
      },
    ),
  ],
});

module.exports = config;
