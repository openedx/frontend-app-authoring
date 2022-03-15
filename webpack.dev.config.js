const path = require('path');
const { getBaseConfig } = require('@edx/frontend-build');
const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Allow serving xblock-bootstrap.html from the MFE itself.
 */
const baseConfig = getBaseConfig('webpack-dev');
module.exports = merge(baseConfig, {
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{
        context: path.resolve(__dirname, 'src/library-authoring/edit-block/LibraryBlock'),
        from: 'xblock-bootstrap.html',
      }],
    }),
  ],
});
