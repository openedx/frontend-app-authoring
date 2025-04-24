# CourseAuthoringOutlineSidebarSlot

### Slot ID: `org.openedx.frontend.authoring.course_outline_sidebar.v1`

### Slot ID Aliases
* `course_authoring_outline_sidebar_slot`

### Plugin Props:

* `courseId` - String.
* `courseName` - String.
* `sections` - Array of Objects. Object structure defined in `index.tsx`.

## Description

The slot wraps the sidebar that is displayed on the course outline page. It can
be used to add additional sidebar components or modify the existing sidebar.

## Example

![Screenshot of the outline sidebar surrounded by border](./images/outline_sidebar_with_border.png)

The following example configuration surrounds the sidebar in a border as shown above.

```js
import { PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.authoring.course_outline_sidebar.v1': {
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
