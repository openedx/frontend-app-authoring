// This file contains configuration for plugins and environment variables.
 
import { PLUGIN_OPERATIONS, DIRECT_PLUGIN } from '@openedx/frontend-plugin-framework';
 
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
    },
};
 
export default config;