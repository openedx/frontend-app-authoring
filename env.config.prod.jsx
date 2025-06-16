import React from 'react';
import { PLUGIN_OPERATIONS, DIRECT_PLUGIN } from '@openedx/frontend-plugin-framework';
import CourseNavigationSidebar from './src/shared-components/CourseNavigationSidebar';
import { SettingsApplications } from '@openedx/paragon/icons';
import { Icon } from '@openedx/paragon';

const config = {
    ...process.env,
    pluginSlots: {
        course_outline_header_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widget: {
                        id: 'course_outline_header_plugin_slot',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: () => <div>This is Header</div>,
                    },
                },
            ],
        },
        footer_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widget: {
                        id: 'footer-plugin',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: () => <div>This is Footer</div>,
                    },
                },
            ],
        },
        course_sidebar_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'course-nav-bar',
                        type: DIRECT_PLUGIN,
                        priority: 1,
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