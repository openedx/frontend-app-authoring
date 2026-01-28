import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  section_1_title: {
    id: 'course-authoring.course-outline.sidebar.section-1.title',
    defaultMessage: 'Creating your course organization',
  },
  section_1_descriptions_1: {
    id: 'course-authoring.course-outline.sidebar.section-1.descriptions-1',
    defaultMessage: 'You add sections, subsections, and units directly in the outline.',
  },
  section_1_descriptions_2: {
    id: 'course-authoring.course-outline.sidebar.section-1.descriptions-2',
    defaultMessage: 'Create a section, then add subsections and units. Open a unit to add course components.',
  },
  section_2_title: {
    id: 'course-authoring.course-outline.sidebar.section-2.title',
    defaultMessage: 'Reorganizing your course',
  },
  section_2_descriptions_1: {
    id: 'course-authoring.course-outline.sidebar.section-2.descriptions-1',
    defaultMessage: 'Drag sections, subsections, and units to new locations in the outline.',
  },
  section_2_link: {
    id: 'course-authoring.course-outline.sidebar.section-2.link',
    defaultMessage: 'Learn more about the course outline',
  },
  section_3_title: {
    id: 'course-authoring.course-outline.sidebar.section-3.title',
    defaultMessage: 'Setting release dates and grading policies',
  },
  section_3_descriptions_1: {
    id: 'course-authoring.course-outline.sidebar.section-3.descriptions-1',
    defaultMessage: 'Select the Configure icon for a section or subsection to set its release date. When you configure a subsection, you can also set the grading policy and due date.',
  },
  section_3_link: {
    id: 'course-authoring.course-outline.sidebar.section-3.link',
    defaultMessage: 'Learn more about grading policy settings',
  },
  section_4_title: {
    id: 'course-authoring.course-outline.sidebar.section-4.title',
    defaultMessage: 'Changing the content learners see',
  },
  section_4_descriptions_1: {
    id: 'course-authoring.course-outline.sidebar.section-4.descriptions-1',
    defaultMessage: 'To publish draft content, select the Publish icon for a section, subsection, or unit.',
  },
  section_4_descriptions_2: {
    id: 'course-authoring.course-outline.sidebar.section-4.descriptions-2',
    defaultMessage: 'To make a section, subsection, or unit unavailable to learners, select the Configure icon for that level, then select the appropriate {hide} option. Grades for hidden sections, subsections, and units are not included in grade calculations.',
  },
  section_4_descriptions_2_hide: {
    id: 'course-authoring.course-outline.sidebar.section-4.descriptions-2.hide',
    defaultMessage: 'Hide',
  },
  section_4_descriptions_3: {
    id: 'course-authoring.course-outline.sidebar.section-4.descriptions-3',
    defaultMessage: 'To hide the content of a subsection from learners after the subsection due date has passed, select the Configure icon for a subsection, then select {hide}. Grades for the subsection remain included in grade calculations.',
  },
  section_4_descriptions_3_hide: {
    id: 'course-authoring.course-outline.sidebar.section-4.descriptions-3.hide',
    defaultMessage: 'Hide content after due date',
  },
  section_4_link: {
    id: 'course-authoring.course-outline.sidebar.section-4.link',
    defaultMessage: 'Learn more about content visibility settings',
  },
  sidebarButtonHelp: {
    id: 'course-authoring.course-outline.sidebar.sidebar-button-help',
    defaultMessage: 'Help',
    description: 'Button label for the help sidebar',
  },
  sidebarButtonAdd: {
    id: 'course-authoring.course-outline.sidebar.sidebar-button-add',
    defaultMessage: 'Add',
    description: 'Button text for add button in sidebar',
  },
  sidebarButtonInfo: {
    id: 'course-authoring.course-outline.sidebar.sidebar-button-info',
    defaultMessage: 'Info',
    description: 'Button label for the info sidebar',
  },
  sidebarButtonAlign: {
    id: 'course-authoring.course-outline.sidebar.sidebar-button-align',
    defaultMessage: 'Align',
    description: 'Alt text for the align button in the outline sidebar',
  },
  sidebarSectionSummary: {
    id: 'course-authoring.course-outline.sidebar.sidebar-section-summary',
    defaultMessage: 'Course Content Summary',
    description: 'Title of the summary section in the sidebar',
  },
  sidebarSectionTaxonomy: {
    id: 'course-authoring.course-outline.sidebar.sidebar-section-taxonomy',
    defaultMessage: 'Taxonomy Alignments',
    description: 'Title of the taxonomy section in the sidebar',
  },
  sidebarSectionTaxonomyManageTags: {
    id: 'course-authoring.course-outline.sidebar.sidebar-section-taxonomy.manage-tags-action',
    defaultMessage: 'Manage tags',
    description: 'Action to open the tags drawer',
  },
  sidebarTabsAddNew: {
    id: 'course-authoring.course-outline.sidebar.sidebar-section-add.add-new-tab',
    defaultMessage: 'Add New',
    description: 'Tab title for adding new components in outline using sidebar',
  },
  sidebarTabsAddExisiting: {
    id: 'course-authoring.course-outline.sidebar.sidebar-section-add.add-existing-tab',
    defaultMessage: 'Add Existing',
    description: 'Tab title for adding existing library components in outline using sidebar',
  },
  sidebarTabsAddExisitingSectionToParent: {
    id: 'course-authoring.course-outline.sidebar.sidebar-section-add.add-existing-tab',
    defaultMessage: 'Adding section to course',
    description: 'Tab title for adding existing library section to a specific parent in outline using sidebar',
  },
  sidebarTabsAddExisitingSubsectionToParent: {
    id: 'course-authoring.course-outline.sidebar.sidebar-section-add.add-existing-tab',
    defaultMessage: 'Adding subsection to {name}',
    description: 'Tab title for adding existing library subsection to a specific parent in outline using sidebar',
  },
  sidebarTabsAddExisitingUnitToParent: {
    id: 'course-authoring.course-outline.sidebar.sidebar-section-add.add-existing-tab',
    defaultMessage: 'Adding unit to {name}',
    description: 'Tab title for adding existing library unit to a specific parent in outline using sidebar',
  },
  sectionContentSummaryText: {
    id: 'course-authoring.course-outline.sidebar.section.content-summary-text',
    defaultMessage: 'Section Content Summary',
    description: 'Title of the summary section in the section info sidebar',
  },
  subsectionContentSummaryText: {
    id: 'course-authoring.course-outline.sidebar.subsection.content-summary-text',
    defaultMessage: 'Subsection Content Summary',
    description: 'Title of the summary section in the subsection info sidebar',
  },
  unitContentSummaryText: {
    id: 'course-authoring.course-outline.sidebar.unit.content-summary-text',
    defaultMessage: 'Unit Content Summary',
    description: 'Title of the summary section in the unit info sidebar',
  },
  openUnitPage: {
    id: 'course-authoring.course-outline.sidebar.unit.open-btn-text',
    defaultMessage: 'Open',
    description: 'Button to open unit page from sidebar',
  },
  publishContainerButton: {
    id: 'course-authoring.course-outline.sidebar.generic.publish.button',
    defaultMessage: 'Publish Changes',
    description: 'Publish button text',
  },
  draftText: {
    id: 'course-authoring.course-outline.sidebar.generic.draft.button',
    defaultMessage: '(Draft)',
    description: 'Draft text in publish button',
  },
  previewTabText: {
    id: 'course-authoring.course-outline.sidebar.generic.preview.tab.text',
    defaultMessage: 'Preview',
    description: 'Preview tab title in container sidebar',
  },
  infoTabText: {
    id: 'course-authoring.course-outline.sidebar.generic.info.tab.text',
    defaultMessage: 'Details',
    description: 'Information tab title in container sidebar',
  },
  settingsTabText: {
    id: 'course-authoring.course-outline.sidebar.generic.info.settings.text',
    defaultMessage: 'Settings',
    description: 'Settings tab title in container sidebar',
  },
  libraryReferenceCardText: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.text',
    defaultMessage: 'Library Reference',
    description: 'Library reference card text in sidebar',
  },
  hasTopParentText: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.has-top-parent-text',
    defaultMessage: '{name} was reused as part of a {parentType}.',
    description: 'Text displayed in sidebar library reference card when a block was reused as part of a parent block',
  },
  hasTopParentBtn: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.has-top-parent-btn',
    defaultMessage: 'View {parentType}',
    description: 'Text displayed in sidebar library reference card button when a block was reused as part of a parent block',
  },
  hasTopParentReadyToSyncText: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.has-top-parent-sync-text',
    defaultMessage: '{name} was reused as part of a {parentType} which has updates available.',
    description: 'Text displayed in sidebar library reference card when a block has updates available as it was reused as part of a parent block',
  },
  hasTopParentReadyToSyncBtn: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.has-top-parent-sync-btn',
    defaultMessage: 'Review Updates',
    description: 'Text displayed in sidebar library reference card button when a block has updates available as it was reused as part of a parent block',
  },
  hasTopParentBrokenLinkText: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.has-top-parent-broken-link-text',
    defaultMessage: '{name} was reused as part of a {parentType} which has a broken link. To recieve library updates to this component, unlink the broken link.',
    description: 'Text displayed in sidebar library reference card when a block was reused as part of a parent block which has a broken link.',
  },
  hasTopParentBrokenLinkBtn: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.has-top-parent-broken-link-btn',
    defaultMessage: 'Unlink {parentType}',
    description: 'Text displayed in sidebar library reference card button when a block was reused as part of a parent block which has a broken link.',
  },
  topParentBrokenLinkText: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.top-parent-broken-link-text',
    defaultMessage: 'The link between {name} and the library version has been broken. To edit or make changes, unlink component.',
    description: 'Text displayed in sidebar library reference card when a block has a broken link.',
  },
  topParentBrokenLinkBtn: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.top-parent-broken-link-btn',
    defaultMessage: 'Unlink from library',
    description: 'Text displayed in sidebar library reference card button when a block has a broken link.',
  },
  topParentModifiedText: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.top-parent-modified-text',
    defaultMessage: '{name} has been modified in this course.',
    description: 'Text displayed in sidebar library reference card when it is modified in course.',
  },
  topParentReaadyToSyncText: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.top-parent-ready-to-sync-text',
    defaultMessage: '{name} has available updates',
    description: 'Text displayed in sidebar library reference card when it is has updates available.',
  },
  topParentReaadyToSyncBtn: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.top-parent-ready-to-sync-btn',
    defaultMessage: 'Review Updates',
    description: 'Text displayed in sidebar library reference card button when it is has updates available.',
  },
  cannotAddAlertMsg: {
    id: 'course-authoring.course-outline.sidebar.library.reference.add-sidebar.alert.text',
    defaultMessage: '{name} is a library {category}. Content cannot be added to Library referenced {category}s.',
    description: 'Alert displayed in sidebar when author tries to add content in library referenced blocks',
  },
});

export default messages;
