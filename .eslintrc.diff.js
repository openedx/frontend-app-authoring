const path = require('path');

// Additional eslint rules specific to the Authoring MFE, which only run on modified files.

module.exports = {
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        {
          // Ban injectIntl() HOC
          group: ['@edx/frontend-platform/i18n'],
          importNames: ['injectIntl'],
          message: "Use 'useIntl' hook instead of injectIntl.",
        },
        {
          // Ban connect()/mapStateToProps/mapDispatchToProps HOC pattern
          group: ['react-redux'],
          importNames: ['connect'],
          message: "Use 'useDispatch' and 'useSelector' hooks instead of 'connect'.",
        },
        // In the near future we will require 'propTypes' to be removed from all modified code too:
        // {
        //   group: ['prop-types'],
        //   message: 'Use TypeScript types instead of propTypes.',
        // },
      ],
    }],
    // Ban 'defaultProps' from any modified code.
    'react/require-default-props': ['error', { functions: 'defaultArguments' }],
  },
  settings: {
    // Import URLs should be resolved using aliases
    'import/resolver': {
      webpack: {
        config: path.resolve(__dirname, 'webpack.dev.config.js'),
      },
    },
  },
};
