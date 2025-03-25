# CourseOutlineHeaderActionsSlot

### Slot ID: `course_outline_header_actions_slot`
### Plugin Props:

* `hasSections` - Boolean. Indicates if the course outline has sections.
* `sections` - Array of objects. Sections of the course outline.

## Description

The slot is positioned in the `SubHeader` section of the Course Outline page, suitable for adding action buttons.

The slot by default contains the action buttons such as `+ New Section`, `Reindex`, `View Live`.

## Example

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { Button } from '@openedx/paragon';

const MyButton = () => (
  <Button>🐣</Button>
);

const config = {
  pluginSlots: {
    course_outline_header_actions_slot: {
      keepDefault: true,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'my-extra-button',
            priority: 60,
            type: DIRECT_PLUGIN,
            RenderWidget: MyButton,
          },
        },
      ]
    }
  },
}

export default config;
```

