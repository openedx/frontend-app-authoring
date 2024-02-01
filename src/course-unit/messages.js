import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  alertFailedGeneric: {
    id: 'course-authoring.course-unit.xblock.alert.error.description',
    defaultMessage: 'Unable to {actionName} {type}. Please try again.',
  },
  alertUnpublishedVersion: {
    id: 'course-authoring.course-unit.xblock.alert.unpublished-version.description',
    defaultMessage: 'Note: The last published version of this unit is live. By publishing changes you will change the student experience.',
  },
  pasteButtonText: {
    id: 'course-authoring.course-unit.paste-component.btn.text',
    defaultMessage: 'Paste component',
  },
  collapseAllButton: {
    id: 'course-authoring.course-unit.xblocks.button.collapse-all',
    defaultMessage: 'Collapse all',
  },
  expandAllButton: {
    id: 'course-authoring.course-unit.xblocks.button.expand-all',
    defaultMessage: 'Expand all',
  },
});

export default messages;
