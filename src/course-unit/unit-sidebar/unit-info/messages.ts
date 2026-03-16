import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  publishInfoDraftSaved: {
    id: 'course-authoring.course-unit.publish.info.draft.saved',
    defaultMessage: 'DRAFT SAVED',
    description: 'Label for the draft date in the publish info section',
  },
  publishLastPublished: {
    id: 'course-authoring.course-unit.publish.info.last.published',
    defaultMessage: 'LAST PUBLISHED',
    description: 'Label for the last published date in the publish info section',
  },
  modalDiscardUnitChangesTitle: {
    id: 'course-authoring.course-unit.modal.discard-unit-changes.title',
    defaultMessage: 'Discard changes',
  },
  modalDiscardUnitChangesActionButtonText: {
    id: 'course-authoring.course-unit.modal.discard-unit-changes.btn.action.text',
    defaultMessage: 'Discard changes',
  },
  modalDiscardUnitChangesCancelButtonText: {
    id: 'course-authoring.course-unit.modal.discard-unit-changes.btn.cancel.text',
    defaultMessage: 'Cancel',
  },
  modalDiscardUnitChangesDescription: {
    id: 'course-authoring.course-unit.modal.discard-unit-changes.description',
    defaultMessage: 'Are you sure you want to revert to the last published version of the unit? You cannot undo this action.',
  },
  modalMakeVisibilityTitle: {
    id: 'course-authoring.course-unit.modal.make-visibility.title',
    defaultMessage: 'Make visible to students',
  },
  modalMakeVisibilityActionButtonText: {
    id: 'course-authoring.course-unit.modal.make-visibility.btn.action.text',
    defaultMessage: 'Make visible to students',
  },
  modalMakeVisibilityCancelButtonText: {
    id: 'course-authoring.course-unit.modal.make-visibility.btn.cancel.text',
    defaultMessage: 'Cancel',
  },
  modalMakeVisibilityDescription: {
    id: 'course-authoring.course-unit.modal.make-visibility.description',
    defaultMessage: 'If the unit was previously published and released to students, any changes you made to the unit when it was hidden will now be visible to students. Do you want to proceed?',
  },
  visibilityVisibleToTitle: {
    id: 'course-authoring.course-unit.visibility.visible-to.title',
    defaultMessage: 'VISIBLE TO',
    description: 'Label for visibility section in the unit sidebar',
  },
  visibilityStaffOnlyTitle: {
    id: 'course-authoring.course-unit.visibility.staff-only.title',
    defaultMessage: 'Staff only',
  },
  visibilityHasExplicitStaffLockText: {
    id: 'course-authoring.course-unit.visibility.has-explicit-staff-lock.text',
    defaultMessage: 'with {sectionName}',
  },
  visibilityStaffAndLearnersTitle: {
    id: 'course-authoring.course-unit.visibility.staff-and-learners.title',
    defaultMessage: 'Staff and learners',
  },
  visibilityCheckboxTitle: {
    id: 'course-authoring.course-unit.visibility.checkbox.title',
    defaultMessage: 'Hide from learners',
  },
  visibilityAccessRestrictionsTitle: {
    id: 'course-authoring.course-unit.visibility.access-restrictions.title',
    defaultMessage: 'Access Restrictions Applied',
    description: 'Label for the access restrictions state',
  },
  visibilityAllLearnersTitle: {
    id: 'course-authoring.course-unit.visibility.all-learners.title',
    defaultMessage: 'All Learners & Staff',
    description: 'Label for the all learners state',
  },
  visibilitySingleGroupDetails: {
    id: 'course-authoring.course-unit.visibility.single-group.details',
    defaultMessage: 'This unit is restricted to {groupName} and Staff',
    description: 'Details text when the visibility state is access restricted with one group.',
  },
  visibilityMultipleGroupsDetails: {
    id: 'course-authoring.course-unit.visibility.multiple-groups.details',
    defaultMessage: 'Access to some content in this unit is restricted to specific groups of learners.',
    description: 'Details text when the visibility state is access restricted with multiple groups',
  },
  visibilityEditButton: {
    id: 'course-authoring.course-unit.visibility.edit.label',
    defaultMessage: 'Edit Visibility',
    description: 'Alt label for the edit visibility icon button',
  },
  visibilitySaveGroupsButton: {
    id: 'course-authoring.course-unit.visibility.save-groups.label',
    defaultMessage: 'Save changes',
    description: 'Label for the button to save the groups in the settings sidebar.',
  },
  sidebarSectionSummary: {
    id: 'course-authoring.unit-page.sidebar.info.section.summary',
    defaultMessage: 'Unit Content Summary',
    description: 'Title for the summary section in the Unit info sidebar',
  },
  sidebarSectionTaxonomies: {
    id: 'course-authoring.unit-page.sidebar.info.section.taxonomies',
    defaultMessage: 'Taxonomy Alignments',
    description: 'Title for the taxonomies section in the Unit info sidebar',
  },
  sidebarInfoVisibilityStudentLabel: {
    id: 'course-authoring.unit-page.sidebar.info.settings.student-visibility',
    defaultMessage: 'Student Visible',
    description: 'Label the button to make the unit visible to students',
  },
  sidebarInfoVisibilityStaffLabel: {
    id: 'course-authoring.unit-page.sidebar.info.settings.staff-visibility',
    defaultMessage: 'Staff Only',
    description: 'Label the button to make the unit visible only to staff',
  },
  sidebarInfoVisibilityTitle: {
    id: 'course-authoring.unit-page.sidebar.info.settings.visibility-title',
    defaultMessage: 'Visibility',
    description: 'Title of the Visibility section of the unit sidebar',
  },
  sidebarInfoAccessTitle: {
    id: 'course-authoring.unit-page.sidebar.info.settings.access-title',
    defaultMessage: 'Access Restrictions',
    description: 'Title of the access section of the unit sidebar',
  },
  sidebarInfoDetailsTab: {
    id: 'course-authoring.unit-page.sidebar.info.details-tab',
    defaultMessage: 'Details',
    description: 'Label for the details tab of the unit info sidebar',
  },
  sidebarInfoSettingsTab: {
    id: 'course-authoring.unit-page.sidebar.info.settings-tab',
    defaultMessage: 'Settings',
    description: 'Label for the settings tab of the unit info sidebar',
  },
});

export default messages;
