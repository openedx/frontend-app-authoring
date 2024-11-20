# File and Videos Page Alerts Slot

### Slot ID: `org.openedx.frontend.authoring.edit_file_error_alerts.v1`

## Description

This slot is used to add alerts to the course file edit page.

## Example

### Additional Alert on Files Page
![🍞 in breadcrumbs slot](./screenshot_files_alert_added.png)

### Additional Alert on Videos Page
![🍞 in breadcrumbs slot](./screenshot_videos_alert_added.png)

The following `env.config.jsx` will wrap the files component with a div that has a large red dashed redborder.

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { Alert } from '@openedx/paragon';

const config = {
  pluginSlots: {
    'org.openedx.frontend.authoring.edit_file_error_alerts.v1': {
      keepDefault: true,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'test-alert',
            type: DIRECT_PLUGIN,
            RenderWidget: () => (
              <Alert variant="warning">
                This is a test alert
              </Alert>
            )
          }
        },
      ]
    }
  },
}

export default config;
```
