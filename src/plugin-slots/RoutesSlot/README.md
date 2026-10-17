# Routes Plugin Slot

### Slot ID: `org.openedx.frontend.authoring.routes.v1`

## Description

Adds top-level pages (routes) to Studio, next to `/home`, `/course/:courseId/*`, etc. Each `Insert`
plugin needs a `path` and a `RenderWidget` component; the component becomes the whole page (it does not
get Studio's header or footer).

Only `Insert` is supported, and the slot has no default content.

## Example

```jsx
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.authoring.routes.v1': {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'hello_page',
            type: DIRECT_PLUGIN,
            path: '/hello',
            RenderWidget: () => <h1>Hello from a plugin route</h1>,
          },
        },
      ],
    },
  },
};

export default config;
```
