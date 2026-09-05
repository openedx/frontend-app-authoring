import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  headerTitle: {
    id: 'course-authoring.competency-management.header.title',
    defaultMessage: 'Competencies',
    description: 'Document title suffix for the Competency Management page.',
  },
  expandAll: {
    id: 'course-authoring.competency-management.expand-all',
    defaultMessage: 'Expand All',
    description: 'Label for the button that expands every node of the competency tree.',
  },
  collapseAll: {
    id: 'course-authoring.competency-management.collapse-all',
    defaultMessage: 'Collapse All',
    description: 'Label for the button that collapses every node of the competency tree.',
  },
  expandRowButtonLabel: {
    id: 'course-authoring.competency-management.expand-row.button-label',
    defaultMessage: 'Expand',
    description: 'Accessible label for the disclosure button on a collapsed competency tree row.',
  },
  collapseRowButtonLabel: {
    id: 'course-authoring.competency-management.collapse-row.button-label',
    defaultMessage: 'Collapse',
    description: 'Accessible label for the disclosure button on an expanded competency tree row.',
  },
  competencyIdAccessibleLabel: {
    id: 'course-authoring.competency-management.competency-id.accessible-label',
    defaultMessage: 'Competency ID: {externalId}',
    description: 'Accessible name for the Competency ID badge, read by screen readers since there is no column header to associate it with.',
  },
});

export default messages;
