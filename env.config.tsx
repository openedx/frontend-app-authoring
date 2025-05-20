// This file contains configuration for plugins and environment variables.

import { PLUGIN_OPERATIONS, DIRECT_PLUGIN } from '@openedx/frontend-plugin-framework';
import CourseNavigationBar from './src/shared-components/CourseNavigationBar'; // Import the new component
import CourseNavigationSidebar from './src/shared-components/CourseNavigationSidebar';
import { SettingsApplications } from '@openedx/paragon/icons';
import { Icon } from '@openedx/paragon';

// Load environment variables from .env file
const config = {
    ...process.env,
    pluginSlots: {
        header_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widget: {
                        id: 'header_plugin_slot',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: () => <div>This is Header</div>, // Render "This is Header" text
                    },
                },
            ],
        },
        footer_plugin_slot: { // New slot for the footer
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widget: {
                        id: 'footer-plugin',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: () => <div>This is Footer</div>, // Render "This is Footer" text
                    },
                },
            ],
        },
        course_sidebar_plugin_slot: { // Use the standard plugin structure
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert, // Operation to insert the widget
                    widget: {
                        id: 'course-nav-bar',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        // Accept and forward all props for dynamic support
                        RenderWidget: (props) => <CourseNavigationSidebar {...props} />,
                    },
                },
            ],
        },
        card_header_menu_icon_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'settings-icon-plugin',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => <Icon src={SettingsApplications} {...props} />,
                    },
                },
            ],
        },
    },
};

export default config;