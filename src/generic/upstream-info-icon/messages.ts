import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  upstreamLinkOk: {
    defaultMessage: 'This item is linked to a library item.',
    id: 'upstream-icon.ok',
    description: 'Hint and aria-label for the upstream icon when the link is valid.',
  },
  upstreamLinkError: {
    defaultMessage: 'The link to the library item is broken.',
    id: 'upstream-icon.error',
    description: 'Hint and aria-label for the upstream icon when the link is broken.',
  },
});

export default messages;
