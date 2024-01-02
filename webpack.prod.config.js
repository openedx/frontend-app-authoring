const path = require('path');
const { createConfig } = require('@edx/frontend-build');
const CopyPlugin = require('copy-webpack-plugin');

const config = createConfig('webpack-prod');

/**
 * Allow serving xblock-bootstrap.html from the MFE itself.
 */
config.plugins.push(
  new CopyPlugin({
    patterns: [{
      context: path.resolve(__dirname, 'src/library-authoring/edit-block/LibraryBlock'),
      from: 'xblock-bootstrap.html',
    }],
  }),
);

module.exports = config;
