# Studio Home Tabs Plugin Slot

### Slot ID: `org.openedx.frontend.authoring.studio_home_tabs.v1`

## Description

Adds a tab to the tab bar at the top of Studio Home, after Courses, Libraries, Legacy Libraries and Taxonomies.
Clicking the tab navigates to `path` (like the Taxonomies tab does), so pair it with a route added through the
[routes slot](../RoutesSlot/).

Each `Insert` plugin needs `title` and `path`; `isVisible` (optional) is a function returning a boolean.
Only `Insert` is supported, and the slot has no default content.

## Example

```jsx
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.authoring.studio_home_tabs.v1': {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'reports_tab',
            type: DIRECT_PLUGIN,
            title: 'Reports',
            path: '/reports',
            isVisible: () => true,
          },
        },
      ],
    },
  },
};

export default config;
```
