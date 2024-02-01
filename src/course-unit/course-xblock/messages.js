import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  blockAltButtonEdit: {
    id: 'course-authoring.course-unit.xblock.button.edit.alt',
    defaultMessage: 'Edit',
    description: 'The xblock edit button text',
  },
  blockActionsDropdownAlt: {
    id: 'course-authoring.course-unit.xblock.button.actions.alt',
    defaultMessage: 'Actions',
    description: 'The xblock three dots dropdown alt text',
  },
  blockLabelButtonCopy: {
    id: 'course-authoring.course-unit.xblock.button.copy.label',
    defaultMessage: 'Copy',
    description: 'The xblock copy button text',
  },
  blockLabelButtonDuplicate: {
    id: 'course-authoring.course-unit.xblock.button.duplicate.label',
    defaultMessage: 'Duplicate',
    description: 'The xblock duplicate button text',
  },
  blockLabelButtonMove: {
    id: 'course-authoring.course-unit.xblock.button.move.label',
    defaultMessage: 'Move',
    description: 'The xblock move button text',
  },
  blockLabelButtonCopyToClipboard: {
    id: 'course-authoring.course-unit.xblock.button.copyToClipboard.label',
    defaultMessage: 'Copy to clipboard',
  },
  blockLabelButtonManageAccess: {
    id: 'course-authoring.course-unit.xblock.button.manageAccess.label',
    defaultMessage: 'Manage access',
    description: 'The xblock manage access button text',
  },
  blockLabelButtonDelete: {
    id: 'course-authoring.course-unit.xblock.button.delete.label',
    defaultMessage: 'Delete',
    description: 'The xblock delete button text',
  },
  visibilityMessage: {
    id: 'course-authoring.course-unit.xblock.visibility.message',
    defaultMessage: 'Access restricted to: {selectedGroupsLabel}',
    description: 'Group visibility accessibility text for xblock',
  },
  validationSummary: {
    id: 'course-authoring.course-unit.xblock.validation.summary',
    defaultMessage: 'This component has validation issues.',
    description: 'The alert text of the visibility validation issues',
  },
  iframeErrorText: {
    id: 'course-authoring.course-unit.xblock.iframe.error.text',
    defaultMessage: 'Unit iframe failed to load. Server possibly returned 4xx or 5xx response.',
  },
  expandTooltip: {
    id: 'course-authoring.course-unit.xblock.expandTooltip',
    defaultMessage: 'Collapse/Expand this block',
  },
});

export default messages;
