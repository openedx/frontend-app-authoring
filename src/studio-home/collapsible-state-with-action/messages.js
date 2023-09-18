import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  deniedCollapsibleTitle: {
    id: 'course-authoring.studio-home.collapsible.denied.title',
    defaultMessage: 'Your course creator request status',
  },
  deniedCollapsibleDescription: {
    id: 'course-authoring.studio-home.collapsible.denied.description',
    defaultMessage: '{studioName} is a hosted solution for our xConsortium partners and selected guests. Courses for which you are a team member appear above for you to edit, while course creator privileges are granted by {platformName}. Our team has completed evaluating your request.',
  },
  deniedCollapsibleActionTitle: {
    id: 'course-authoring.studio-home.collapsible.denied.action.title',
    defaultMessage: 'Your course creator request status:',
  },
  deniedCollapsibleState: {
    id: 'course-authoring.studio-home.collapsible.denied.state',
    defaultMessage: 'Denied',
  },
  deniedCollapsibleActionText: {
    id: 'course-authoring.studio-home.collapsible.denied.action.text',
    defaultMessage: 'Your request did not meet the criteria/guidelines specified by {platformName} Staff.',
  },
  pendingCollapsibleTitle: {
    id: 'course-authoring.studio-home.collapsible.pending.title',
    defaultMessage: 'Your course creator request status',
  },
  pendingCollapsibleDescription: {
    id: 'course-authoring.studio-home.collapsible.pending.description',
    defaultMessage: '{studioName} is a hosted solution for our xConsortium partners and selected guests. Courses for which you are a team member appear above for you to edit, while course creator privileges are granted by {platformName}. Our team is currently evaluating your request.',
  },
  pendingCollapsibleActionTitle: {
    id: 'course-authoring.studio-home.collapsible.pending.action.title',
    defaultMessage: 'Your course creator request status:',
  },
  pendingCollapsibleState: {
    id: 'course-authoring.studio-home.collapsible.pending.state',
    defaultMessage: 'Pending',
  },
  pendingCollapsibleActionText: {
    id: 'course-authoring.studio-home.collapsible.pending.action.text',
    defaultMessage: 'Your request is currently being reviewed by {platformName} staff and should be updated shortly.',
  },
  unrequestedCollapsibleTitle: {
    id: 'course-authoring.studio-home.collapsible.unrequested.title',
    defaultMessage: 'Becoming a course creator in {studioShortName}',
  },
  unrequestedCollapsibleDescription: {
    id: 'course-authoring.studio-home.collapsible.unrequested.description',
    defaultMessage: '{studioName} is a hosted solution for our xConsortium partners and selected guests. Courses for which you are a team member appear above for you to edit, while course creator privileges are granted by {platformName}. Our team will evaluate your request and provide you feedback within 24 hours during the work week.',
  },
  unrequestedCollapsibleDefaultButton: {
    id: 'course-authoring.studio-home.collapsible.unrequested.button.default',
    defaultMessage: 'Request the ability to create courses',
  },
  unrequestedCollapsiblePendingButton: {
    id: 'course-authoring.studio-home.collapsible.unrequested.button.pending',
    defaultMessage: 'Submitting your request',
  },
  unrequestedCollapsibleFailedButton: {
    id: 'course-authoring.studio-home.collapsible.unrequested.button.failed',
    defaultMessage: 'Sorry, there was error with your request',
  },
});

export default messages;
