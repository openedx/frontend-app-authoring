import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  creditEligibilityLabel: {
    id: 'course-authoring.grading-settings.credit.eligibility.label',
    defaultMessage: 'Minimum credit-eligible grade:',
  },
  creditEligibilityDescription: {
    id: 'course-authoring.grading-settings.credit.eligibility.description',
    defaultMessage: '% Must be greater than or equal to the course passing grade',
  },
  creditEligibilityErrorMsg: {
    id: 'course-authoring.grading-settings.credit.eligibility.error.msg',
    defaultMessage: 'Not able to set passing grade to less than:',
  },
});

export default messages;
