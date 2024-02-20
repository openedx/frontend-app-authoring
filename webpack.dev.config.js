const { createConfig } = require('@openedx/frontend-build');

const config = createConfig('webpack-dev', {
  resolve: {
    fallback: {
      fs: false,
      constants: false,
    },
  },
});

module.exports = config;
