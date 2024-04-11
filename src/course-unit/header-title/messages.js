import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  altButtonEdit: {
    id: 'course-authoring.course-unit.heading.button.edit.alt',
    defaultMessage: 'Edit',
    description: 'The unit edit button text',
  },
  ariaLabelButtonEdit: {
    id: 'course-authoring.course-unit.heading.button.edit.aria-label',
    defaultMessage: 'Edit field',
    description: 'The unit edit button aria label',
  },
  altButtonSettings: {
    id: 'course-authoring.course-unit.heading.button.settings.alt',
    defaultMessage: 'Settings',
    description: 'The unit settings button text',
  },
  definedVisibilityMessage: {
    id: 'course-authoring.course-unit.heading.visibility.defined.message',
    defaultMessage: 'Access to this unit is restricted to: {selectedGroupsLabel}',
    description: 'Group visibility accessibility text for Unit',
  },
  commonVisibilityMessage: {
    id: 'course-authoring.course-unit.heading.visibility.common.message',
    defaultMessage: 'Access to some content in this unit is restricted to specific groups of learners.',
    description: 'The label text of some content restriction in this unit',
  },
});

export default messages;
