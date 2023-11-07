const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig(
  'eslint',
  {
    rules: {
      'jsx-a11y/label-has-associated-control': [2, {
        controlComponents: ['Input'],
      }],
      'template-curly-spacing': 'off',
      'react-hooks/exhaustive-deps': 'off',
      indent: ['error', 2],
      'no-restricted-exports': 'off',
    },
    settings: {
      // Import URLs should be resolved using aliases
      'import/resolver': {
        webpack: {
          config: path.resolve(__dirname, 'webpack.dev.config.js'),
        },
      },
    },
    overrides: [
      {
        files: ['plugins/**/*.test.jsx', 'some-other-repo/plugins/**/*.test.jsx'],
        rules: {
          'import/no-extraneous-dependencies': 'off',
        },
      },
    ],
  },
);
