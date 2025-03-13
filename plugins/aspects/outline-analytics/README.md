# OutlineAnalytics

The `OutlineAnalytics` plugin provides Aspects based metrics in Course Outline page  of the Studio. It is intended to 
be plugged in to the [CourseOutlineAnalyticsSlot](../../../src/plugin-slots/CourseOutlineAnalyticsSlot).

The plugin is automatically imported and configured when Open edX Aspects is deployed in an instance with `tutor-contrib-aspects`.

## Example Configuration

```js
import OutlineAnalytics from '@openedx-plugins/aspects-outline-analytics';
import { PLUGIN_OPERATIONS, DIRECT_PLUGIN } from '@openedx/frontend-plugin-framework';

const config = {
  ...process.env,
  pluginSlots: {
    course_outline_analytics_slot: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'aspects-outline-analytics',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: OutlineAnalytics,
          },
        },
      ],
    },
  },
};

export default config;
```
