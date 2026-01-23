import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  requirementsEntrance: {
    id: 'course-authoring.schedule-section.requirements.entrance.label',
    defaultMessage: 'Entrance exam',
  },
  requirementsEntranceCollapseTitle: {
    id: 'course-authoring.schedule-section.requirements.entrance.collapse.title',
    defaultMessage: 'Require students to pass an exam before beginning the course.',
  },
  requirementsEntranceCollapseParagraph: {
    id: 'course-authoring.schedule-section.requirements.entrance.collapse.paragraph',
    defaultMessage: 'You can now view and author your course entrance exam from the {hyperlink}.',
  },
  requirementsEntranceCollapseHyperlink: {
    id: 'course-authoring.schedule-section.requirements.entrance.collapse.hyperlink',
    defaultMessage: 'course outline',
  },
});

export default messages;
