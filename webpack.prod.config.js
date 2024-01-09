const { createConfig } = require('@edx/frontend-build');

const config = createConfig('webpack-prod', {
  resolve: {
    fallback: {
      fs: false,
      constants: false,
    },
  },
});

module.exports = config;
