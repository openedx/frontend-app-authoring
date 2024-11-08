import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  sidebarTitleDraftNeverPublished: {
    id: 'course-authoring.course-unit.sidebar.title.draft.never-published',
    defaultMessage: 'Draft (never published)',
  },
  sidebarTitleVisibleToStaffOnly: {
    id: 'course-authoring.course-unit.sidebar.title.visible.to-staff-only',
    defaultMessage: 'Visible to staff only',
  },
  sidebarTitlePublishedAndLive: {
    id: 'course-authoring.course-unit.sidebar.title.published.live',
    defaultMessage: 'Published and live',
  },
  sidebarTitleDraftUnpublishedChanges: {
    id: 'course-authoring.course-unit.sidebar.title.draft.unpublished',
    defaultMessage: 'Draft (unpublished changes)',
  },
  sidebarTitlePublishedNotYetReleased: {
    id: 'course-authoring.course-unit.sidebar.title.published.not-yet-released',
    defaultMessage: 'Published (not yet released)',
  },
  sidebarHeaderUnitLocationTitle: {
    id: 'course-authoring.course-unit.sidebar.header.unit-location.title',
    defaultMessage: 'Unit location',
  },
  sidebarBodyNote: {
    id: 'course-authoring.course-unit.sidebar.body.note',
    defaultMessage: 'Note: Do not hide graded assignments after they have been released.',
  },
  publishInfoPreviouslyPublished: {
    id: 'course-authoring.course-unit.publish.info.previously-published',
    defaultMessage: 'Previously published',
  },
  publishInfoDraftSaved: {
    id: 'course-authoring.course-unit.publish.info.draft.saved',
    defaultMessage: 'Draft saved on {editedOn} by {editedBy}',
  },
  publishLastPublished: {
    id: 'course-authoring.course-unit.publish.info.last.published',
    defaultMessage: 'Last published {publishedOn} by {publishedBy}',
  },
  releaseInfoUnscheduled: {
    id: 'course-authoring.course-unit.release.info.unscheduled',
    defaultMessage: 'Unscheduled',
  },
  releaseInfoWithSection: {
    id: 'course-authoring.course-unit.release.info.with-unit',
    defaultMessage: 'with {sectionName}',
  },
  visibilityIsVisibleToTitle: {
    id: 'course-authoring.course-unit.visibility.is-visible-to.title',
    defaultMessage: 'IS VISIBLE TO',
  },
  visibilityWillBeVisibleToTitle: {
    id: 'course-authoring.course-unit.visibility.will-be-visible-to.title',
    defaultMessage: 'WILL BE VISIBLE TO',
  },
  unitLocationTitle: {
    id: 'course-authoring.course-unit.unit-location.title',
    defaultMessage: 'LOCATION ID',
  },
  unitLocationDescription: {
    id: 'course-authoring.course-unit.unit-location.description',
    defaultMessage: 'To create a link to this unit from an HTML component in this course, enter /jump_to_id/{id} as the URL value',
  },
  visibilityCheckboxTitle: {
    id: 'course-authoring.course-unit.visibility.checkbox.title',
    defaultMessage: 'Hide from learners',
  },
  visibilityStaffOnlyTitle: {
    id: 'course-authoring.course-unit.visibility.staff-only.title',
    defaultMessage: 'Staff only',
  },
  visibilityStaffAndLearnersTitle: {
    id: 'course-authoring.course-unit.visibility.staff-and-learners.title',
    defaultMessage: 'Staff and learners',
  },
  visibilityHasExplicitStaffLockText: {
    id: 'course-authoring.course-unit.visibility.has-explicit-staff-lock.text',
    defaultMessage: 'with {sectionName}',
  },
  actionButtonPublishTitle: {
    id: 'course-authoring.course-unit.action-buttons.publish.title',
    defaultMessage: 'Publish',
  },
  actionButtonDiscardChangesTitle: {
    id: 'course-authoring.course-unit.action-button.discard-changes.title',
    defaultMessage: 'Discard changes',
  },
  actionButtonCopyUnitTitle: {
    id: 'course-authoring.course-unit.action-button.copy-unit.title',
    defaultMessage: 'Copy unit',
  },
  releaseStatusTitle: {
    id: 'course-authoring.course-unit.status.release.title',
    defaultMessage: 'RELEASE',
  },
  releasedStatusTitle: {
    id: 'course-authoring.course-unit.status.released.title',
    defaultMessage: 'RELEASED',
  },
  scheduledStatusTitle: {
    id: 'course-authoring.course-unit.status.scheduled.title',
    defaultMessage: 'SCHEDULED',
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
  sidebarSplitTestAddComponentTitle: {
    id: 'course-authoring.course-unit.split-test.sidebar.add-component.title',
    defaultMessage: 'Adding components',
    description: 'Title for the section that explains how to add components to a split test',
  },
  sidebarSplitTestSelectComponentType: {
    id: 'course-authoring.course-unit.split-test.sidebar.add-component.select-type',
    defaultMessage: 'Select a component type under {bold_tag}Add New Component{bold_tag}. Then select a template.',
    description: 'Instruction text for selecting a component type and template when adding new components',
  },
  sidebarSplitTestComponentAdded: {
    id: 'course-authoring.course-unit.split-test.sidebar.add-component.component-added',
    defaultMessage: 'The new component is added at the bottom of the page or group. You can then edit and move the component.',
    description: 'Instruction text indicating that the component has been added and can be moved or edited',
  },
  sidebarSplitTestEditComponentTitle: {
    id: 'course-authoring.course-unit.split-test.sidebar.edit-component.title',
    defaultMessage: 'Editing components',
    description: 'Title for the section that explains how to edit components in a split test',
  },
  sidebarSplitTestEditComponentInstruction: {
    id: 'course-authoring.course-unit.split-test.sidebar.edit-component.instruction',
    defaultMessage: 'Click the {bold_tag}Edit{bold_tag} icon in a component to edit its content.',
    description: 'Instruction text for editing a component by clicking the edit icon',
  },
  sidebarSplitTestReorganizeComponentTitle: {
    id: 'course-authoring.course-unit.split-test.sidebar.reorganize-component.title',
    defaultMessage: 'Reorganizing components',
    description: 'Title for the section that explains how to reorganize components within a split test',
  },
  sidebarSplitTestReorganizeComponentInstruction: {
    id: 'course-authoring.course-unit.split-test.sidebar.reorganize-component.instruction',
    defaultMessage: 'Drag components to new locations within this component.',
    description: 'Instruction text for reorganizing components by dragging them to new locations within a split test',
  },
  sidebarSplitTestReorganizeGroupsInstruction: {
    id: 'course-authoring.course-unit.split-test.sidebar.reorganize-component.drag-to-groups',
    defaultMessage: 'For content experiments, you can drag components to other groups.',
    description: 'Instruction text for dragging components to other groups for content experiments',
  },
  sidebarSplitTestExperimentComponentTitle: {
    id: 'course-authoring.course-unit.split-test.sidebar.experiment-component.title',
    defaultMessage: 'Working with content experiments',
    description: 'Title for the section that explains how to work with content experiments',
  },
  sidebarSplitTestExperimentComponentInstruction: {
    id: 'course-authoring.course-unit.split-test.sidebar.experiment-component.confirm-config',
    defaultMessage: 'Confirm that you have properly configured content in each of your experiment groups.',
    description: 'Instruction text reminding users to check content configuration in each experiment group',
  },
  sidebarSplitTestLearnMoreLinkLabel: {
    id: 'course-authoring.course-unit.split-test.sidebar.learn-more-link.label',
    defaultMessage: 'Learn more about component containers',
    description: 'Text for a link that directs users to more information about component containers in the split test setup.',
  },
});

export default messages;
