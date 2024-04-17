import WholeCourseTranslation from '@edx/course-app-translation-plugin';
import { PLUGIN_OPERATIONS, DIRECT_PLUGIN } from '@openedx/frontend-plugin-framework';

// Load environment variables from .env file
const config = {
  ...process.env,
  pluginSlots: {
    additional_course_plugin: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'whole-course-translation-plugin',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: WholeCourseTranslation,
          },
        },
      ],
    },
  },
};

export default config;
