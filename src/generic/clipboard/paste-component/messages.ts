import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  popoverContentText: {
    id: 'course-authoring.generic.paste-component.popover.content.text',
    defaultMessage: 'From:',
    description: 'The popover content label before the source course name of the copied content.',
  },
  pasteButtonWhatsInClipboardText: {
    id: 'course-authoring.generic.paste-component.paste-button.whats-in-clipboard.text',
    defaultMessage: "What's in my clipboard?",
    description: 'The popover trigger button text of the info about copied content.',
  },
});

export default messages;
