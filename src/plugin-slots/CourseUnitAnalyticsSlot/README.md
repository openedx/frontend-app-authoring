# CourseUnitAnalyticsSlot

### Slot ID: `course_unit_analytics_slot`
### Props:
* `unitTitle` - String. Title of the Unit.
* `isUnitVerticalType` - Boolean. Indicates if the unit is displaying a Vertical type block. It would be `false` for a Library content block.
* `courseVerticalChildren` - Array of objects. Each object represents a component block inside the vertical block.

## Description

The slot is positioned in the `header-navigations` section of the Course Unit page, suitable for adding an action button.

This slot is empty by default. It adds an "Analytics" button when Aspects is deployed in the instance.

## Example

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import MyButton from 'myButtonLibrary';

const config = {
  pluginSlots: {
    course_unit_analytics_slot: {
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
    },
    // other slot configurations
  },
}

export default config;
```
