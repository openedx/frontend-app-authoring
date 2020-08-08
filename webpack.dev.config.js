const path = require('path');
const { getBaseConfig } = require('@edx/frontend-build');
const Merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Serve xblock-bootstrap.html from the MFE itself.
 */
const baseConfig = getBaseConfig('webpack-dev');
module.exports = Merge.smart(baseConfig, {
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{
        context: path.resolve(__dirname, 'src/library-authoring/edit-block/LibraryBlock'),
        from: 'xblock-bootstrap.html',
      }],
    }),
  ],
});
