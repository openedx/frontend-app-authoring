import { getConfig } from '@edx/frontend-platform';
import { PLUGIN_OPERATIONS, DIRECT_PLUGIN } from '@openedx/frontend-plugin-framework';

import { getPluginHomeTabs, STUDIO_HOME_TABS_SLOT_ID } from '.';

jest.mock('@edx/frontend-platform', () => ({ getConfig: jest.fn() }));

const widget = (extra = {}) => ({
  op: PLUGIN_OPERATIONS.Insert,
  widget: { id: 'tab', type: DIRECT_PLUGIN, title: 'Converter', path: '/course-converter', ...extra },
});
const withPlugins = (plugins: object[]) => (getConfig as jest.Mock).mockReturnValue({
  pluginSlots: { [STUDIO_HOME_TABS_SLOT_ID]: { plugins } },
});

describe('StudioHomeTabsSlot', () => {
  it('returns no tabs without configuration', () => {
    (getConfig as jest.Mock).mockReturnValue({});
    expect(getPluginHomeTabs()).toEqual([]);
  });

  it('turns Insert plugins into tabs', () => {
    withPlugins([widget()]);
    expect(getPluginHomeTabs()).toEqual([{ key: 'tab', title: 'Converter', path: '/course-converter' }]);
  });

  it('ignores other operations and incomplete widgets', () => {
    withPlugins([{ op: PLUGIN_OPERATIONS.Hide, widgetId: 'x' }, widget({ title: undefined }), widget({ path: undefined })]);
    expect(getPluginHomeTabs()).toEqual([]);
  });

  it('honours isVisible', () => {
    withPlugins([widget({ isVisible: () => false })]);
    expect(getPluginHomeTabs()).toEqual([]);
    withPlugins([widget({ isVisible: () => true })]);
    expect(getPluginHomeTabs()).toHaveLength(1);
  });
});
