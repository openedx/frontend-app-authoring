# File and Videos Page Alerts Slot

### Slot ID: `edit_file_error_alerts_slot`

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
    edit_file_error_alerts_slot: {
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
