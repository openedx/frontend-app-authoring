import { defineMessages } from '@edx/frontend-platform/i18n';
import { messageGuard } from '../common/data';

const messages = defineMessages({
  'library.courseImport.loading.message': {
    id: 'library.courseImport.loading.message',
    defaultMessage: 'Loading...',
    description: 'Message when data is being loaded',
  },
  'library.courseImport.page.parent_heading': {
    id: 'library.courseImport.page.parent_heading',
    defaultMessage: 'Settings',
    description: 'Small text heading above the main title for the access page',
  },
  'library.courseImport.page.heading': {
    id: 'library.courseImport.page.heading',
    defaultMessage: 'Course Import',
    description: 'Title of course import settings page',
  },
  'library.courseImport.aside.title': {
    id: 'library.courseImport.aside.title',
    defaultMessage: "Can't see your course?",
    description: 'Header for the aside description of the access page.',
  },
  'library.courseImport.aside.text.first': {
    id: 'library.courseImport.aside.text.first',
    defaultMessage: 'To import a course, you will need to be an admin of that course',
    description: 'The first paragraph of detail text on course imports.',
  },
  'library.courseImport.aside.text.second': {
    id: 'library.courseImport.aside.text.second',
    defaultMessage: 'If you do not see your course here, contact the course owners and ask them for access.',
    description: 'The first paragraph of detail text on course imports.',
  },
});

export default messageGuard(messages);
