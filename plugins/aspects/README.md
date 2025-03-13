# Aspects Plugins

This directory contains a collection of plugins to be used with [Open edX Aspects](https://github.com/openedx/openedx-aspects).

## Using the plugins

The plugins are automatically activated via [tutor-contrib-aspects](https://github.com/openedx/tutor-contrib-aspects).

## Manual Installation

To manually install the plugins for development and testing run:

```shell
npm install ./plugins/aspects/<plugin-directory>

# Example
npm install ./plugins/aspects/outline-analytics
```

Then, configure their corresponding [plugin slots](../../src/plugin-slots) in the `env.config.jsx` file. See the README
file in each plugin for more details about the slots and the configuration.

