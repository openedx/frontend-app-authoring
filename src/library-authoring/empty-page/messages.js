import { defineMessages } from '@edx/frontend-platform/i18n';
import { messageGuard } from '../common/data';

const messages = defineMessages({
  'library.list.empty.body': {
    id: 'library.list.empty.body',
    defaultMessage: `Content libraries provide a flexible way to author content
    for use in one or many courses. Additionally, you can author content prior 
    to knowing its exact course location, and easily include it in your course later.`,
    description: 'Text for the body on empty library listing page.',
  },
  'library.list.empty.heading': {
    id: 'library.list.empty.heading',
    defaultMessage: 'Add your first library to get started',
    description: 'Text for the heading on empty library listing page.',
  },
  'library.list.empty.new.library': {
    id: 'library.list.empty.new.library',
    defaultMessage: 'New Library',
    description: 'Text for the new library button on empty library listing page.',
  },
});

export default messageGuard(messages);
