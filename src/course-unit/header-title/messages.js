import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  altButtonEdit: {
    id: 'course-authoring.course-unit.heading.button.edit.alt',
    defaultMessage: 'Edit',
  },
  ariaLabelButtonEdit: {
    id: 'course-authoring.course-unit.heading.button.edit.aria-label',
    defaultMessage: 'Edit field',
  },
  altButtonSettings: {
    id: 'course-authoring.course-unit.heading.button.settings.alt',
    defaultMessage: 'Settings',
  },
  definedVisibilityMessage: {
    id: 'course-authoring.course-unit.heading.visibility.defined.message',
    defaultMessage: 'Access to this unit is restricted to: {selectedGroupsLabel}',
  },
  commonVisibilityMessage: {
    id: 'course-authoring.course-unit.heading.visibility.common.message',
    defaultMessage: 'Access to some content in this unit is restricted to specific groups of learners.',
  },
});

export default messages;
