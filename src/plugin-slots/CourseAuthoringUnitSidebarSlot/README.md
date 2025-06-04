# CourseAuthoringUnitSidebarSlot

The component currently holds 2 versions of the slot. Version 2 wraps version 1 and hence, is a
superset of version 1.

### Slot IDs:
* `org.openedx.frontend.authoring.course_unit_sidebar.v2`
* `org.openedx.frontend.authoring.course_unit_sidebar.v1`

### Slot ID Aliases
* `org.openedx.frontend.authoring.course_unit_sidebar.v1` - `course_authoring_unit_sidebar_slot`

### Plugin Props:

#### Version 1

* `courseId` - String.
* `blockId` - String. The usage id of the current unit being viewed / edited.
* `unitTitle` - String. The name of the current unit being viewed / edited.
* `xBlocks` - Array of Objects. List of XBlocks in the Unit. Object structure defined in `index.tsx`.
* `readOnly` - Boolean. True if the user should not be able to edit the contents of the unit.

#### Extra props in Version 2

* `isUnitVerticalType` - Boolean. If the unit category is `vertical`.
* `isSplitTestType` - Boolean. If the unit category is `split_test`.

## Description

The slot wraps the sidebar that is displayed on the unit editor page. It can
be used to add additional sidebar components or modify the existing sidebar.

## Example 1

![Screenshot of the unit sidebar surrounded by border](./images/unit_sidebar_with_border.png)

The following example configuration surrounds the sidebar in a border as shown above.

```js
import { PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.authoring.course_unit_sidebar.v2': {
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

## Example 2

![Screenshot of the unit sidebar with an extra component listing all the problem blocks](./images/unit_sidebar_with_problem_blocks_list.png)

```js
import { PLUGIN_OPERATIONS, DIRECT_PLUGIN  } from '@openedx/frontend-plugin-framework';

const ProblemBlocks = ({unitTitle, xBlocks}) => (
  <>
    <h4 className="h4">{unitTitle}: Problem Blocks</h4>
    <ul>
      {xBlocks
        .filter(block => block.blockType === "problem")
        .map(block => <li key={block.id}>{block.displayName}</li>)
      }
    </ul>
  </>
);

const config = {
  pluginSlots: {
    'org.openedx.frontend.authoring.course_unit_sidebar.v2': {
      keepDefault: true,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget:{
            id: 'problem-blocks-list',
            priority: 1,
            type: DIRECT_PLUGIN,
            RenderWidget: ProblemBlocks,
          }
        },
      ],
    },
  }
};
export default config;
```
