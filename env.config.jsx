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
    Button,
    ProgressBar
} from '@openedx/paragon';
import FormSwitchGroup from './src/generic/FormSwitchGroup';
import StatusBarContent from './src/course-outline/status-bar/StatusBarContent'
import CustomStatusBar from './src/course-outline/status-bar/CustomStatusBar';
import SubHeader from './src/generic/sub-header/SubHeader';
import CourseUpdatesNew from './src/course-updates/CourseUpdatesNew';
import CourseExportPageNew from './src/export-page/CourseExportPageNew'
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import WarningMessage from './src/generic/warning-message/WarningMessage';
import SettingCard from './src/advanced-settings/setting-card/SettingCard';
import ExportSidebarNew from '/src/export-page/export-sidebar/ExportSidebarNew';
import CourseChecklistCustom from './src/plugins-components/CourseChecklistCustom';
import ChecklistItemBody from './src/course-checklist/ChecklistSection/ChecklistItemBody';
import ChecklistItemComment from './src/course-checklist/ChecklistSection/ChecklistItemComment';
import FilesPageNew from './src/files-and-videos/files-page/FilesPageNew';
import GalleryCardNew from './src/files-and-videos/generic/table-components/GalleryCardNew';
import PagesAndResourcesNew from './src/pages-and-resources/PagesAndResourcesNew';
import TextbooksNew from './src/textbooks/TextbooksNew';
import CustomPagesNew from './src/custom-pages/CustomPagesNew';
import EditorPage from './src/editors/EditorPage';
import ImportSidebarNew from '/src/import-page/import-sidebar/ImportSidebarNew';

// Example custom component for the schedule_and_details_plugin_slot
import CustomCreateLibrary from './src/library-authoring/create-library/CustomCreateLibrary';

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
                            const {
                                onAddSection,
                                onCollapseAll,
                                isSectionsExpanded,
                                handleExpandAll,
                                headerActions,
                            } = pluginProps || {};
                            return (
                                <StatusBarContent
                                    onAddSection={onAddSection}
                                    onCollapseAll={onCollapseAll}
                                    isSectionsExpanded={isSectionsExpanded}
                                    handleExpandAll={handleExpandAll}
                                    headerActions={headerActions}
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

        course_team_header_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "course-team-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <div className="course-team-custom-header">
                                <div className="course-team-custom-sub-header">
                                    <span>{props.contentTitle}</span>
                                    <SubHeader
                                        headerActions={props.isAllowActions && (
                                            <Button
                                                variant="primary"
                                                iconBefore={props.iconBefore}
                                                size="sm"
                                                onClick={props.onClick}
                                                disabled={props.disabled}
                                            >
                                                {props.buttonText}
                                            </Button>
                                        )}
                                    />
                                </div>
                                <hr style={{ border: 'none', borderTop: '1px solid #e5e6e6', margin: '0 0 0 0' }} />
                            </div>
                        ),
                    },
                }
            ],
        },

        advanced_settings_header_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "advanced-settings-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <div className="advanced-settings-custom-header">
                                <div className="advanced-settings-custom-sub-header">
                                    <div className="advanced-settings-custom-sub-header-title">
                                        <SubHeader
                                            title={props.headerTitle}
                                            contentTitle={props.headerContentTitle}
                                        />
                                    </div>

                                    <div className="custom-setting-items-deprecated-setting">
                                        <Button
                                            variant={'outline-primary'}
                                            onClick={() => props.onClick()}
                                            size="sm"
                                        >
                                            <FormattedMessage
                                                id="course-authoring.advanced-settings.deprecated.button.text"
                                                defaultMessage="{visibility} deprecated settings"
                                                values={{
                                                    visibility:
                                                        props.showDeprecated ? props.hideDeprecatedMessage
                                                            : props.showDeprecatedMessage,
                                                }}
                                            />
                                        </Button>
                                    </div>
                                </div>
                                
                                <hr style={{ border: 'none', borderTop: '1px solid #e5e6e6', margin: '0 0 0 0' }} />

                                <div className="warning-message-container">
                                    <WarningMessage message="Do not modify these policies unless you are familiar with their purpose." />
                                </div>
                            </div>
                        ),
                    },
                }
            ],
        },

        advanced_settings_card_plugin_slot: {
            plugins: [
              {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                  id: "my-advanced-settings-card",
                  type: DIRECT_PLUGIN,
                  priority: 1,
                  RenderWidget: (props) => (
                    <div className={`custom-setting-card ${props.settingData?.deprecated ? 'show-deprecated-style' : ''}`}>
                        <SettingCard {...props} />
                        {props.settingData?.deprecated && (
                            <span className="deprecated-label">Deprecated</span>
                        )}
                    </div>
                  ),
                },
              },
            ],
          },

          certificates_header_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "certificates-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <div className="certificates-custom-header">
                                <div className="certificates-custom-sub-header">
                                    <div className="certificates-custom-sub-header-title">
                                        <SubHeader
                                            title={props.title}
                                            headerActions={props.headerActions}
                                        />
                                    </div>
                                </div>
                                
                                <hr style={{ border: 'none', borderTop: '1px solid #e5e6e6', margin: '0 0 0 0' }} />

                            </div>
                        ),
                    },
                }
            ],
        },

        certificates_header_hide_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                }
            ],
        },

        course_checklist_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "course-checklist-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <CourseChecklistCustom {...props} />
                        ),
                    },
                }
            ],
        },

        course_checklist_section_title_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "course-checklist-section-title",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <div className="custom-checklist-section-title-container">
                                <div className="custom-checklist-section-title">
                                    <h3 aria-describedby={props.getCompletionCountID()} className="lead">{props.dataHeading}</h3>
                                    <div data-testid="completion-subheader">
                                        {props.getCompletionCount(props.checks, props.totalCompletedChecks)}
                                    </div>
                                </div>
                                <ProgressBar
                                        now={(props.totalCompletedChecks / (props.checks?.length || 1)) * 100}
                                        // srOnlyText={`${props.totalCompletedChecks} of ${props.checks?.length || 1} completed`}
                                        className="custom-checklist-section-progress-bar"
                                    />
                            </div>
                        ),
                    },
                }
            ],
        },

        course_checklist_section_completion_subheader_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                }
            ]
        },

        course_checklist_section_checklist_item_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "course-checklist-section-checklist-item",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <div
                                className={`checklist-item-card border py-3 px-4 ${props.isCompleted && 'checklist-item-complete'}`}
                                id={`checklist-item-${props.checkId}`}
                                data-testid={`checklist-item-${props.checkId}`}
                                key={props.checkId}
                            >
                                <ChecklistItemBody {...{ checkId: props.checkId, isCompleted: props.isCompleted, updateLink: props.updateLink }} />
                                <div data-testid={`comment-section-${props.checkId}`}>
                                    <ChecklistItemComment {...{ checkId: props.checkId, outlineUrl: props.outlineUrl, data: props.data }} />
                                </div>
                            </div>
                        )
                    }
                }
            ]
        },

        create_library_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "create-library-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <CustomCreateLibrary {...props} />
                        ),
                    },
                }
            ],
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
                        <div>
                            <SubHeader
                            contentTitle={props.contentTitle}
                            description={props.description}
                            />
                            <span className="grading-sub-header"></span>
                        </div>
                    ),
                },
                },
            ],
        },
        course_updates_plugin_slot: {
            plugins: [
                {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: "course_updates",
                    type: DIRECT_PLUGIN,
                    priority: 1,
                    RenderWidget: (props) => 
                        <CourseUpdatesNew courseId={props.courseId}/>
                    },
                },
            ],
        },
        course_export_plugin_slot: {
            plugins: [
                {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: "course_export",
                    type: DIRECT_PLUGIN,
                    priority: 1,
                    RenderWidget: (props) => 
                        <CourseExportPageNew courseId={props.courseId}/>
                    },
                },
            ],
        },
        courseoutline_header_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "course-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <div style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '1rem' }}>
                                Course Outline
                            </div>
                        ),
                    },
                },
            ],
        },
        course_export_stepper_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "course-stepper",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <div>
                                {props.index !== props.steps.length - 1 && (
                                    <span className="course-stepper__icon-line" />
                                )}
                            </div>
                        ),
                    },
                },
            ],
        },
        export_sidebar_plugin_slot: {
            plugins: [
                {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: "export_footer",
                    type: DIRECT_PLUGIN,
                    priority: 1,
                    RenderWidget: (props) => 
                        <ExportSidebarNew />
                    },
                },
            ],
        },
        files_page_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "files_page",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => 
                            <FilesPageNew courseId={props.courseId} />
                    },
                },
            ],
        },
        gallery_card_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "gallery_card",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <GalleryCardNew
                                original={props.original}
                                handleBulkDownload={props.handleBulkDownload}
                                handleLockFile={props.handleLockFile}
                                handleOpenDeleteConfirmation={props.handleOpenDeleteConfirmation}
                                handleOpenFileInfo={props.handleOpenFileInfo}
                                thumbnailPreview={props.thumbnailPreview}
                                fileType={props.fileType}
                            />
                        ),
                    },
                },
            ],
        },
        pages_resources_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "pages_resources",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => 
                        <PagesAndResourcesNew courseId={props.courseId} />
                    },
                },
            ],
        },
        textbook_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "textbook",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => 
                        <TextbooksNew {...props} />
                    },
                },
            ],
        },
        custom_pages_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "custom_pages",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => 
                        <CustomPagesNew {...props} />
                    },
                },
            ],
        },
        import_sidebar_plugin_slot: {
            plugins: [
                {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: "import_sidebar",
                    type: DIRECT_PLUGIN,
                    priority: 1,
                    RenderWidget: (props) =>
                        <ImportSidebarNew />
                    },
                },
            ],
        },
        // edit_modal_plugin_slot: {
        //     plugins: [
        //         {
        //             op: PLUGIN_OPERATIONS.Insert,
        //             widget: {
        //                 id: "custom_pages",
        //                 type: DIRECT_PLUGIN,
        //                 priority: 1,
        //                 RenderWidget: (props) => 
        //                 <div className='edit-modal'>
        //                     <EditorPage
        //                     courseId={courseId}
        //                     blockType="html"
        //                     blockId={pageId}
        //                     studioEndpointUrl={getConfig().STUDIO_BASE_URL}
        //                     lmsEndpointUrl={getConfig().LMS_BASE_URL}
        //                     returnFunction={onClose}
        //                     />
        //                 </div>
        //             },
        //         },
        //     ],
        // },
    }
};

export default config;
