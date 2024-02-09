// eslint-disable-next-line import/no-extraneous-dependencies
const { createConfig } = require('@openedx/frontend-build');

const config = createConfig('eslint', {
  rules: {
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'import/no-self-import': 'off',
    'spaced-comment': ['error', 'always', { block: { exceptions: ['*'] } }],
    'react-hooks/rules-of-hooks': 2,
    'react-hooks/exhaustive-deps': 'off',
    'no-promise-executor-return': 'off',
    'no-param-reassign': ['error', { props: false }],
    radix: 'off',
  },
});

config.settings = {
  'import/resolver': {
    alias: {
      map: [
        ['editors', './src/editors'],
      ],
    },
    node: {
      paths: ['editors', 'node_modules'],
      extensions: ['.js', '.jsx'],
    },
  },
};

module.exports = config;
