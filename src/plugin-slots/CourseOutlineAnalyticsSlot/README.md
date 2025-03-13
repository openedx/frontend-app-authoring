# CourseOutlineAnalyticsSlot

### Slot ID: `course_outline_analytics_slot`
### Props:
* `hasSections` - Boolean. Indicates if the course outline has sections.
* `sections` - Array of objects. Sections of the course outline.

## Description

The slot is positioned in the `header-navigation` section of the Course Outline page, suitable for adding an action button.

This slot is empty by default. It adds an "Analytics" button, when Aspects is deployed with an instance.

## Example

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { Button } from '@openedx/paragon';

const MyButton = () => (
  <Button>🐣</Button>
);

const config = {
  pluginSlots: {
    course_outline_analytics_slot: {
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

