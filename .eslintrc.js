const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const { createConfig } = require('@openedx/frontend-build');

module.exports = createConfig(
  'eslint',
  {
    rules: {
      'jsx-a11y/label-has-associated-control': [2, {
        controlComponents: ['Input'],
      }],
      'template-curly-spacing': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'no-restricted-exports': 'off',
      // This added because 'aria-description' is not reconginzed as valid prop for reac <=17
      // ref: https://github.com/facebook/react/issues/21035 because it's new.
      // once this MFE upgrade to react >18, it can be removed.
      'jsx-a11y/aria-props': 'off',
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
        files: ['plugins/**/*.test.jsx'],
        rules: {
          'import/no-extraneous-dependencies': 'off',
        },
      },
    ],
  },
);
