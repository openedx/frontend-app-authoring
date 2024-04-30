import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  section_1_title: {
    id: 'course-authoring.textbooks.sidebar.section-1.title',
    defaultMessage: 'Why should I break my textbook into chapters?',
  },
  section_1_descriptions: {
    id: 'course-authoring.textbooks.sidebar.section-1.descriptions',
    defaultMessage: 'Breaking your textbook into multiple chapters reduces loading times for students, especially those with slow Internet connections. Breaking up textbooks into chapters can also help students more easily find topic-based information.',
  },
  section_2_title: {
    id: 'course-authoring.textbooks.sidebar.section-2.title',
    defaultMessage: 'What if my book isn\'t divided into chapters?',
  },
  section_2_descriptions: {
    id: 'course-authoring.textbooks.sidebar.section-2.descriptions',
    defaultMessage: 'If your textbook doesn\'t have individual chapters, you can upload the entire text as a single chapter and enter a name of your choice in the Chapter Name field.',
  },
  sectionLink: {
    id: 'course-authoring.textbooks.sidebar.section-link',
    defaultMessage: 'Learn more',
  },
});

export default messages;
