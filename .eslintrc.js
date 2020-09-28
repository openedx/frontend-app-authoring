const { createConfig } = require('@edx/frontend-build');

const combined = createConfig('eslint', {});

// This is already defined upstream, so we need to modify it. The merge functionality provided by createConfig
// doesn't handle it correctly.
combined.rules["import/no-extraneous-dependencies"][1].devDependencies.push("**/specs/**");
module.exports = combined;
