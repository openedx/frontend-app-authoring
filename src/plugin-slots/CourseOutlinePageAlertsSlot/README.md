# Course Outline Page Alerts Slot

### Slot ID: `course_outline_page_alerts_slot`

## Description

This slot is used to add alerts to the course outline page.

## Example

### Additional Alert
![Additional Alerts in Outline Page](./screenshot_outline_alert_added.png)

The following `env.config.jsx` will wrap the files component with a div that has a large red dashed redborder.

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { Alert } from '@openedx/paragon';

const config = {
  pluginSlots: {
    course_outline_page_alerts_slot: {
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
