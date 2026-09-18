import { mergeConfig } from '@edx/frontend-platform';
import pluginConfig from './pluginConfig';

const baseProps = { placeholder: '', enableImageUpload: true };

const externalPlugins = {
  a11ychecker: 'https://cdn.example.com/a11ychecker/plugin.min.js',
  powerpaste: 'https://cdn.example.com/powerpaste/plugin.min.js',
};

describe('pluginConfig', () => {
  afterEach(() => {
    mergeConfig({ TINYMCE_EXTERNAL_PLUGINS: {}, TINYMCE_PLUGIN_OPTIONS: {} });
  });

  test('does not load any external plugins by default', () => {
    const { plugins, toolbar, config } = pluginConfig({ ...baseProps, editorType: 'text' });
    expect(config.external_plugins).toEqual({});
    expect(plugins).not.toContain('a11ychecker');
    expect(toolbar).not.toContain('a11ycheck');
    expect(config).not.toHaveProperty('powerpaste_word_import');
  });

  test('loads operator-configured premium plugins', () => {
    mergeConfig({
      TINYMCE_EXTERNAL_PLUGINS: externalPlugins,
      TINYMCE_PLUGIN_OPTIONS: { powerpaste_word_import: 'clean', a11ychecker_level: 'aaa' },
    });
    const { plugins, toolbar, quickbarsSelectionToolbar, config } = pluginConfig({ ...baseProps, editorType: 'text' });
    expect(config.external_plugins).toEqual(externalPlugins);
    expect(plugins.split(' ')).toEqual(expect.arrayContaining(['a11ychecker', 'powerpaste']));
    expect(toolbar).toContain('a11ycheck');
    expect(quickbarsSelectionToolbar).toBe(false);
    expect(config.powerpaste_allow_local_images).toBe(true);
    expect(config.powerpaste_word_import).toBe('clean'); // operator override wins over the default
    expect(config.a11ychecker_level).toBe('aaa');
  });

  test('adds the accessibility checker button to the expandable editor quickbar', () => {
    mergeConfig({ TINYMCE_EXTERNAL_PLUGINS: { a11ychecker: externalPlugins.a11ychecker } });
    const { toolbar, quickbarsSelectionToolbar, config } = pluginConfig({ ...baseProps, editorType: 'expandable' });
    expect(toolbar).toBe(false);
    expect(quickbarsSelectionToolbar).toContain('a11ycheck');
    expect(config).not.toHaveProperty('powerpaste_word_import');
  });
});
