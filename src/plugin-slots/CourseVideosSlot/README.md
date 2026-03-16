# Course Video Upload Page Slot

### Slot ID: `org.openedx.frontend.authoring.videos_upload_page_table.v1`

## Description

This slot is used to replace/modify/hide the course video upload page UI.

## Example

### Wrapped with a div with dashed border

![Red Border around Videos UI on course without videos showing upload UI](./screenshot_upload_videos_border_wrap.png)

![Red Border around Videos UI on course with videos list](./screenshot_list_videos_border_wrap.png)

The following `env.config.jsx` will wrap the videos UI with a div that has a large dashed red border.

```js
import { PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.authoring.videos_upload_page_table.v1': {
      keepDefault: true,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Wrap,
          widgetId: 'default_contents',
          wrapper: ({component}) =>  (
            <div style={{border:'thick dashed red'}}>
            {component}
            </div>
          )
        },
      ]
    }
  },
}

export default config;
```
