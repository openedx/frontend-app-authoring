const { createConfig } = require('@edx/frontend-build');

const combined = createConfig('eslint', {});

combined.plugins = Array.isArray(combined.plugins) ? [...combined.plugins, "jsx-a11y"] : ["jsx-a11y"];

// This is already defined upstream, so we need to modify it. The merge functionality provided by createConfig
// doesn't handle it correctly.
combined.rules["import/no-extraneous-dependencies"][1].devDependencies.push("**/specs/**");

// https://github.com/evcohen/eslint-plugin-jsx-a11y/issues/340#issuecomment-338424908
combined.rules["jsx-a11y/anchor-is-valid"] = [ "error", {
  "components": [ "Link" ],
  "specialLink": [ "to" ]
}];

combined.rules["jsx-a11y/label-has-for"] =  [ 2, {
  "components": [ "label" ],
  "required": "id",
  "allowChildren": false
}]

module.exports = combined;
