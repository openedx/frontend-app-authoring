# Course Video Upload Page Slot

### Slot ID: `videos_upload_page_table_slot`

## Description

This slot is used to replace/modify/hide the course video upload page UI.

## Example

### Wrapped with a div with dashed border
![Red Border around Videos UI](./screenshot_videos_border_wrap.png)

The following `env.config.jsx` will wrap the files component with a div that has a large red dashed redborder.

```js
import { PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    videos_upload_page_table_slot: {
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
