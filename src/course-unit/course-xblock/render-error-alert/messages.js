import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  alertRenderErrorMessage: {
    id: 'course-authoring.course-unit.xblock.alert.render-error.message',
    defaultMessage: 'Error: {message}',
  },
  alertRenderErrorTitle: {
    id: 'course-authoring.course-unit.xblock.alert.render-error.title',
    defaultMessage: 'We\'re having trouble rendering your component',
  },
  alertRenderErrorDescription: {
    id: 'course-authoring.course-unit.xblock.alert.render-error.description',
    defaultMessage: 'Students will not be able to access this component. Re-edit your component to fix the error.',
  },
});

export default messages;
