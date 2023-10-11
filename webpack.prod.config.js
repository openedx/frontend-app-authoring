/*
 * The loader for typescript is being replaced in production since when compiling 'babel'
 * it throws errors. In 'webpack-dev-server' this has not been changed as it works without problems.
 */
const { getBaseConfig } = require('@edx/frontend-build');

const config = getBaseConfig('webpack');

config.module.rules.push(
  {
    test: /\.tsx?$/,
    use: 'ts-loader',
    exclude: /node_modules/,
  },
);

config.resolve.extensions.push('.ts');
config.resolve.extensions.push('.tsx');

module.exports = config;
