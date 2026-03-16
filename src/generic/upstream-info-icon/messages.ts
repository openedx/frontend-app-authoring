import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  upstreamLinkOk: {
    defaultMessage: 'This item is linked to a library item',
    id: 'upstream-icon.ok',
    description: 'Hint and aria-label for the upstream icon when the link is valid.',
  },
  upstreamLinkError: {
    defaultMessage: 'The referenced library or library object is not available',
    id: 'upstream-icon.error',
    description: 'Hint and aria-label for the upstream icon when the link is broken.',
  },
  upstreamLinkReadyToSyncAriaLabel: {
    defaultMessage: 'The linked library object has updates available',
    id: 'upstream-icon.ready-to-sync.aria-label',
    description: 'Hint and aria-label for the upstream icon when the link is ready to sync.',
  },
  upstreamLinkReadyToSyncTooltip: {
    defaultMessage: 'The linked <b>{upstreamName}</b> has updates available',
    id: 'upstream-icon.ready-to-sync.tooltip',
    description: 'Tooltip text for the upstream icon when the link is ready to sync.',
  },
  upstreamLinkOverridesAriaLabel: {
    defaultMessage: 'This library reference has course overrides applied',
    id: 'upstream-icon.course-overrides.aria-label',
    description: 'Hint and aria-label for the upstream icon when the link has course overrides.',
  },
  upstreamLinkTooltip: {
    defaultMessage: 'This is referenced via <b>{upstreamName}</b>',
    id: 'upstream-icon.ok.tooltip',
    description: 'Tooltip text for the upstream icon when the link is valid.',
  },
});

export default messages;
