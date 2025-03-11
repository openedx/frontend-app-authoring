# UnitAnalytics

The `UnitAnalytics` plugin provides Aspects based metrics in Course Unit page of the Studio. It is intended to 
be plugged in to the [CourseUnitAnalyticsSlot](../../../src/plugin-slots/CourseUnitAnalyticsSlot).

The plugin is automatically imported and configured when Open edX Aspects is deployed in an instance with `tutor-contrib-aspects`.

## Example Configuration
 ```js
import UnitAnalytics from '@openedx-plugins/aspects-unit-analytics';
import { PLUGIN_OPERATIONS, DIRECT_PLUGIN } from '@openedx/frontend-plugin-framework';

const config = {
  ...process.env,
  pluginSlots: {
    course_unit_analytics_slot: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'aspects-unit-analytics',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: UnitAnalytics,
          },
        },
      ],
    },
  },
};

export default config;
```
