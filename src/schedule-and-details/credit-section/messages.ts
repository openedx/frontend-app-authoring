import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  creditTitle: {
    id: 'course-authoring.schedule.credit.title',
    defaultMessage: 'Course credit requirements',
  },
  creditDescription: {
    id: 'course-authoring.schedule.credit.description',
    defaultMessage: 'Steps required to earn course credit',
  },
  creditHelp: {
    id: 'course-authoring.schedule.credit.help',
    defaultMessage:
      'A requirement appears in this list when you publish the unit that contains the requirement.',
  },
  creditMinimumGrade: {
    id: 'course-authoring.schedule.credit.minimum-grade',
    defaultMessage: 'Minimum grade',
  },
  creditProctoredExam: {
    id: 'course-authoring.schedule.credit.proctored-exam',
    defaultMessage: 'Successful proctored exam',
  },
  creditVerification: {
    id: 'course-authoring.schedule.credit.verification',
    defaultMessage: 'ID Verification',
  },
  creditNotFound: {
    id: 'course-authoring.schedule.credit.not-found',
    defaultMessage: 'No credit requirements found.',
  },
});

export default messages;
