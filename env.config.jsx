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
    ProgressBar,
    Container,
    Stack,
    ActionRow,
    Layout
} from '@openedx/paragon';
import FormSwitchGroup from './src/generic/FormSwitchGroup';
import StatusBarContent from './src/course-outline/status-bar/StatusBarContent'
import CustomStatusBar from './src/course-outline/status-bar/CustomStatusBar';
import SubHeader from './src/generic/sub-header/SubHeader';
import CustomCourseUpdates from './src/course-updates/CustomCourseUpdates';
import CustomCourseExportPage from './src/export-page/CustomCourseExportPage'
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import WarningMessage from './src/generic/warning-message/WarningMessage';
import SettingCard from './src/advanced-settings/setting-card/SettingCard';
import CustomExportSidebar from '/src/export-page/export-sidebar/CustomExportSidebar';
import CourseChecklistCustom from './src/plugins-components/CourseChecklistCustom';
import ChecklistItemBody from './src/course-checklist/ChecklistSection/ChecklistItemBody';
import ChecklistItemComment from './src/course-checklist/ChecklistSection/ChecklistItemComment';
import CustomFilesPage from './src/files-and-videos/files-page/CustomFilesPage';
import CustomGalleryCard from './src/files-and-videos/generic/table-components/CustomGalleryCard';
import CustomPagesAndResources from './src/pages-and-resources/CustomPagesAndResources';
import CustomTextbooks from './src/textbooks/CustomTextbooks';
import CustomPagesNew from './src/custom-pages/CustomPagesNew';
import EditorPage from './src/editors/EditorPage';
import CustomImportSidebar from '/src/import-page/import-sidebar/CustomImportSidebar';
import CustomCourseUpdate from './src/course-updates/course-update/CustomCourseUpdate';
import CourseRerunForm from './src/course-rerun/course-rerun-form';
import CourseRerunSideBar from './src/course-rerun/course-rerun-sidebar';

// Example custom component for the schedule_and_details_plugin_slot
import CustomCreateLibrary from './src/library-authoring/create-library/CustomCreateLibrary';
import CustomLibrariesV2 from './src/studio-home/tabs-section/libraries-v2-tab/CustomLibrariesV2';
import CustomLibraryAuthoringPage from './src/library-authoring/CustomLibraryAuthoringPage';
import CustomLibraryCollectionPage from './src/library-authoring/collections/CustomLibraryCollectionPage';
import CustomTaxonomyListPage from './src/taxonomy/CustomTaxonomyListPage';
import CustomTaxonomyDetailPage from './src/taxonomy/taxonomy-detail/CustomTaxonomyDetailPage';
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
                        <div className="viewLiveDiv">
                            <CustomStatusBar
                                className="viewLiveCustom"
                                courseId={props.courseId}
                                isLoading={props.isLoading}
                                statusBarData={props.statusBarData}
                                openEnableHighlightsModal={props.openEnableHighlightsModal}
                                handleVideoSharingOptionChange={props.handleVideoSharingOptionChange}
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
                                <hr className='customHr' />
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
                        id: "my-custom-advanced-settings-content",
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
                                
                                <hr className="customHr" />

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

        advanced_settings_header_removal_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                }
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
                                
                                <hr className='customHr' />

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

        libraries_v2_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "libraries-v2-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <CustomLibrariesV2 {...props} />
                        ),
                    },
                }
            ],
        },

        library_authoring_page_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "library-authoring-page-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <CustomLibraryAuthoringPage {...props} />
                        ),
                    },
                }
            ],
        },

        library_authoring_collection_page_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "library-authoring-collection-page-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <CustomLibraryCollectionPage {...props} />
                        ),
                    },
                }
            ],
        },

        course_rerun_header_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widget: {
                        id: "course-rerun-header-content",
                    }
                }
            ]
        },

        course_rerun_footer_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widget: {
                        id: "course-rerun-footer-content",
                    }
                }
            ]
        },

        course_rerun_content_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "course-rerun-content-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <Container size="xl" className="small p-4 mt-3">
                                <section >
                                    <Layout
                                        lg={[{ span: 9 }, { span: 3 }]}
                                        md={[{ span: 9 }, { span: 3 }]}
                                        sm={[{ span: 9 }, { span: 3 }]}
                                        xs={[{ span: 9 }, { span: 3 }]}
                                        xl={[{ span: 9 }, { span: 3 }]}
                                    >
                                        <Layout.Element>
                                            <div className='course-rerun-content'>
                                                <section>
                                                    <header className="d-flex">
                                                        <Stack>
                                                            <h2>
                                                                {props.rerunTitle} {props.displayName}
                                                            </h2>
                                                            <span className="large">{props.originalCourseData}</span>
                                                        </Stack>
                                                        <ActionRow className="ml-auto">
                                                            <Button variant="outline-primary" size="sm" onClick={props.cancelButtonClick}>
                                                                {props.cancelButton}
                                                            </Button>
                                                        </ActionRow>
                                                    </header>
                                                    <hr className='customHr' />
                                                </section>

                                                <div className='course-rerun-form'>
                                                    <CourseRerunForm
                                                        initialFormValues={props.initialFormValues}
                                                        onClickCancel={props.handleRerunCourseCancel}
                                                    />
                                                </div>

                                            </div>
                                        </Layout.Element>
                                        <Layout.Element>
                                            <CourseRerunSideBar />
                                        </Layout.Element>
                                    </Layout>
                                </section>
                            </Container>
                        ),
                    }
                }
            ]
        },

        taxonomy_list_page_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "taxonomy-list-page-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <CustomTaxonomyListPage {...props} />
                        ),
                    },
                }
            ],
        },

        taxonomy_detail_page_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "taxonomy-detail-page-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <CustomTaxonomyDetailPage {...props} />
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
                        <CustomCourseUpdates courseId={props.courseId}/>
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
                        <CustomCourseExportPage courseId={props.courseId}/>
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
                            <h2 className='courseOutlineh2'>
                                Course Outline
                            </h2>
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
                        <CustomExportSidebar />
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
                            <CustomFilesPage courseId={props.courseId} />
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
                            <CustomGalleryCard
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
                        <CustomPagesAndResources courseId={props.courseId} />
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
                        <CustomTextbooks {...props} />
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
                        <CustomImportSidebar />
                    },
                },
            ],
        },
        course_update_card_plugin_slot: {
            plugins: [
                {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: "course_update_card",
                    type: DIRECT_PLUGIN,
                    priority: 1,
                    RenderWidget: (props) =>
                        <CustomCourseUpdate  {...props}/>
                    },
                },]},
        group_configurations_hide_plugin_slot: {
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                }
            ],
        },
        group_config_header_plugin_slot: {
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
                                            subtitle={props.subtitle}
                                            // headerActions={props.headerActions}
                                        />
                                    </div>
                                </div>
                                
                                <hr className='customHr' />

                            </div>
                        ),
                    },
                }
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
