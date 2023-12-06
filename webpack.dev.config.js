const path = require('path');
const { createConfig } = require('@edx/frontend-build');
// const CopyPlugin = require('copy-webpack-plugin');

const config = createConfig('webpack-dev');

// /**
//  * Allow serving xblock-bootstrap.html from the MFE itself.
//  */
// config.plugins.push(
//   new CopyPlugin({
//     patterns: [{
//       context: path.resolve(__dirname, 'src/edit-library-block/LibraryBlock'),
//       from: 'xblock-bootstrap.html',
//     }],
//   }),
// );
config.resolve.alias['@src'] = path.resolve(__dirname, 'src/');

module.exports = config;
