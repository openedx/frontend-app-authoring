import { getConfig } from '@edx/frontend-platform';
import { PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

export const STUDIO_HOME_TABS_SLOT_ID = 'org.openedx.frontend.authoring.studio_home_tabs.v1';

export interface StudioHomeTab {
  key: string;
  title: string;
  path: string;
}

/**
 * Extra tabs for the Studio Home tab bar (Courses, Libraries, ...), contributed through `env.config.jsx`.
 *
 * Not a <PluginSlot>: Paragon's <Tabs> iterates its children and needs real <Tab> elements, so this
 * returns plain data and TabsSection renders the tabs. Clicking a tab navigates to its `path`.
 * Only `Insert` is supported. A widget may set `isVisible: () => boolean` to hide itself.
 */
export const getPluginHomeTabs = (): StudioHomeTab[] => {
  const { plugins = [] } = (getConfig() as any).pluginSlots?.[STUDIO_HOME_TABS_SLOT_ID] ?? {};
  return plugins
    .filter((plugin: any) => plugin.op === PLUGIN_OPERATIONS.Insert && plugin.widget?.title && plugin.widget?.path)
    .filter((plugin: any) => plugin.widget.isVisible?.() ?? true)
    .map(({ widget }: any) => ({ key: widget.id, title: widget.title, path: widget.path }));
};
