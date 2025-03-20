# CourseAuthoringUnitSidebarSlot

### Slot ID: `course_authoring_unit_sidebar_slot`

### Plugin Props:

* `courseId` - String.
* `blockId` - String. The usage id of the current unit being viewed / edited.
* `unitTitle` - String. The name of the current unit being viewed / edited.

## Description

The slot wraps the sidebar that is displayed on the unit editor page. It can
be used to add additional sidebar components or modify the existing sidebar.

## Example

![Screenshot of the unit sidebar surrounded by border](./images/unit_sidebar_with_border.png)

The following example configuration inserts an extra button to the header as shown above.

```js
import { PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    course_authoring_unit_sidebar_slot: {
      keepDefault: true,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Wrap,
          widgetId: 'default_contents',
          wrapper: ({ component }) => (
            <div style={{ border: 'thick dashed red' }}>{component}</div>
          ),
        },
      ],
    },
  }
};
export default config;
```
