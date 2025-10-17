# Course Outline Page Alerts Slot

### Slot ID: `org.openedx.frontend.authoring.course_outline_page_alerts.v1`

## Description

This slot is used to add alerts to the course outline page.

## Example

### Additional Alert

![Additional Alerts in Outline Page](./screenshot_outline_alert_added.png)

The following `env.config.jsx` display a custom additional alert on the course outline page.

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { Alert } from '@openedx/paragon';

const config = {
  pluginSlots: {
    'org.openedx.frontend.authoring.course_outline_page_alerts.v1': {
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
