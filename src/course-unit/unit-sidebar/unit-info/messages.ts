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
    id: 'course-authoring.course-unit.visibility.edit.lable',
    defaultMessage: 'Edit Visibility',
    description: 'Alt label for the edit visibility icon button',
  },
});

export default messages;
