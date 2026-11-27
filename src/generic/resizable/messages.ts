import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  handleLabel: {
    id: 'course-authoring.generic.resizable.handle.label',
    defaultMessage: 'Resize panel',
    description: 'Accessible name of the draggable handle on the edge of a resizable panel.',
  },
  handleValueText: {
    id: 'course-authoring.generic.resizable.handle.value-text',
    defaultMessage: '{width} pixels wide',
    description: 'Screen reader text for the current width of a resizable panel. {width} is a number of pixels.',
  },
});

export default messages;
