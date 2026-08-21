import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  typeToConfirmInstruction: {
    id: 'course-authoring.generic.type-to-confirm-instruction',
    defaultMessage: 'Type <strong>{X}</strong> to confirm',
  },
  readOnlyTooltip: {
    id: 'course-authoring.generic.read-only-tooltip',
    defaultMessage: 'Your role doesn\'t include permission to do this. Contact your org admin to request access',
    description: 'Tooltip message shown on actions a user cannot perform because their role is read-only.',
  },
});

export default messages;
