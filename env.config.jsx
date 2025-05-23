// This file contains configuration for plugins and environment variables.

import { PLUGIN_OPERATIONS, DIRECT_PLUGIN } from '@openedx/frontend-plugin-framework';
import CourseNavigationSidebar from './src/shared-components/CourseNavigationSidebar';
import CustomScheduleAndDetails from './src/CustomScheduleAndDetails';
import messages from './src/schedule-and-details/messages';
import { Settings, DragHandle, SettingsApplications } from '@openedx/paragon/icons';
import {
    Icon,
    IconButton,
    Dropdown,
    Button
} from '@openedx/paragon';
import FormSwitchGroup from './src/generic/FormSwitchGroup';
import StatusBarContent from './src/course-outline/status-bar/StatusBarContent'
import CustomStatusBar from './src/course-outline/status-bar/CustomStatusBar';
import SubHeader from './src/generic/sub-header/SubHeader';
import SectionSubHeader from './src/generic/section-sub-header';

// Example custom component for the schedule_and_details_plugin_slot

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
                        RenderWidget: (props) => <CourseNavigationSidebar />,
                    },
                },
            ],
        },
        card_header_menu_icon_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'card-header-menu-icon',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: ({ namePrefix }) => (
                            <Dropdown.Toggle
                                className="item-card-header__menu"
                                id={`${namePrefix}-card-header__menu`}
                                data-testid={`${namePrefix}-card-header__menu-button`}
                                as={IconButton}
                                src={Settings}
                                alt={`${namePrefix}-card-header__menu`}
                                iconAs={Icon}
                            />
                        ),
                    },
                },
            ],
        },
        drag_indicator_icon_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'drag-indicator-icon',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: () => <Icon src={DragHandle} className="btn-icon-secondary" />,
                    },
                },
            ],
        },
        schedule_and_details_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'custom-schedule-details',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => <CustomScheduleAndDetails {...props} messages={messages} />,
                    },
                },
            ],
        },
        schedule_and_details_icon_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Replace,
                    widget: {
                        id: 'schedule-details-icon',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => <Icon src={SettingsApplications} {...props} />,
                    },
                },
            ],
        },
        course_highlight_emails_toggle_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'default-highlight-emails-toggle',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: ({
                            highlightsEnabledForMessaging,
                            isEnablingHighlights,
                            handleHighlightEmailsToggle,
                            intl,
                        }) => (
                            <FormSwitchGroup
                                id="course-highlight-emails-toggle"
                                label={intl.formatMessage(messages.highlightEmailsTitle)}
                                helpText={intl.formatMessage(messages.highlightEmailsLink)}
                                checked={highlightsEnabledForMessaging}
                                onChange={handleHighlightEmailsToggle}
                                disabled={isEnablingHighlights}
                            />
                        ),
                    },
                },
            ],
        },
        sub_header_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widget: {
                        id: 'sub_header_plugin_slot',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: () => <div>This is Header</div>, // Render "This is Header" text
                    },
                },
            ],
        },
        statusbar_content_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'statusbar-content',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (pluginProps) => {
                            const { onAddSection, onCollapseAll, isSectionsExpanded, handleExpandAll } = pluginProps || {};
                            return (
                                <StatusBarContent
                                    onAddSection={onAddSection}
                                    onCollapseAll={onCollapseAll}
                                    isSectionsExpanded={isSectionsExpanded}
                                    handleExpandAll={handleExpandAll}
                                />
                            );
                        },
                    },
                }
            ],
        },
        view_live_button_slot: {
            plugins: [{
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: 'statusbar-with-view-live',
                    type: DIRECT_PLUGIN,
                    priority: 1,
                    RenderWidget: (props) => (
                        <div style={{ fontSize: '1rem' }}>
                            <CustomStatusBar
                                style={{ fontSize: '0.75rem' }}
                                courseId={props.courseId}
                                isLoading={props.isLoading}
                                statusBarData={props.statusBarData}
                                openEnableHighlightsModal={props.openEnableHighlightsModal}
                                handleVideoSharingOptionChange={props.handleVideoSharingOptionChange}
                                renderViewLiveButton={() => (
                                    <Button
                                        variant="outline-primary"
                                        onClick={() => window.open('http://apps.local.openedx.io:2000/learning/course/course-v1:TE+cs100+tyu', '_blank')}
                                        style={{ height: '6%', width: '11%', fontSize: '0.75rem', marginTop: '10px' }}
                                    >
                                        View live
                                    </Button>
                                )}
                            />
                        </div>
                    ),
                },
            }]
        },
        grading_header_plugin_slot: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: "grading-content",
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: (props) => (
              <SubHeader
                contentTitle={props.contentTitle}
                description={props.description}
              />
            ),
          },
        },
      ],
    },
    grading_header_styleplugin_slot: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: "grading-content-style",
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: (props) => (
              <div>
                <header className="grading-sub-header-content">
                <h2 className="grading-sub-header-content-title">
                  {props.contentTitle}
                </h2>
                <span className="grading-desc small">{props.description}</span>
                </header>
              </div>
            ),
          },
        },
      ],
    },
    grading_section_sub_header_plugin_slot: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: "grading-content-sub-header",
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: (props) => (
              <SectionSubHeader
                title={props.title}
                description={props.description}
              />
            ),
          },
        },
      ],
    },
    grading_sub_header_styleplugin_slot: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: "grading-content-style",
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: (props) => (
              <div>
                <header className="grading-section-sub-header">
                  <h2 className="lead">{props.title}</h2>
                  <span className="small grading-rules-desc">
                    {props.description}
                  </span>
                </header>
              </div>
            ),
          },
        },
      ],
    },
    grading_assignment_section_sub_header_plugin_slot: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: "grading-assignment-content",
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: (props) => (
              <header className='mt-4 mx-0 mb-2'>
                <h2 className="lead">
                  {props.title}
                </h2>
                <span className="small grading-rules-desc">
                  {props.description}
                </span>
              </header>
            ),
          },
        },
      ],
    },
    },
};

export default config;