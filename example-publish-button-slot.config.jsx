import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import HidePublishButtonForStaff from './src/plugin-slots/CourseUnitPublishButtonSlot/example';

// Load environment variables from .env file
const config = {
  ...process.env,
  pluginSlots: {
    // Example: Hide the Publish button for staff users
    'org.openedx.frontend.authoring.course_unit_publish_button.v1': {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Replace,
          widget: {
            id: 'hide_publish_for_staff',
            type: DIRECT_PLUGIN,
            RenderWidget: HidePublishButtonForStaff,
          },
        },
      ],
    },
  },
};

export default config;

