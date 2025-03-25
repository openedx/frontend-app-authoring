# CourseUnitHeaderActionsSlot

### Slot ID: `course_unit_header_actions_slot`
### Plugin Props:

* `headerNavigationsActions` - Object. See the prop-types definition in the component for details.
* `unitCategory` - String.
* `unitTitle` - String. Title of the Unit
* `isUnitVerticalType` - Boolean. Flag indicating if the Unit is VerticalBlock type. It's false for others like Library Blocks.
* `verticalBlocks` - Array. List of the vertical blocks.

## Description

The slot is positioned in the `SubHeader` section of the Course Unit editor page. It is suitable for adding action buttons.

By default, the slot contains the action buttons like **View Live Version** and **Preview**.

## Example

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { Button } from '@openedx/paragon';

const MyButton = () => (
  <Button>🐣</Button>
);

const config = {
  pluginSlots: {
    course_unit_header_actions_slot: {
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
