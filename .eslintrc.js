const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('eslint',
  {
    rules: {
      'jsx-a11y/label-has-associated-control': [2, {
        controlComponents: ['Input'],
      }],
      'template-curly-spacing': 'off',
      'react-hooks/exhaustive-deps': 'off',
      indent: 'off',
    },
  });
