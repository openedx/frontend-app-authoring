import { defineMessages } from '@edx/frontend-platform/i18n';
import { messageGuard } from '../common/data';

const messages = defineMessages({
  'library.course_import.loading.message': {
    id: 'library.course_import.loading.message',
    defaultMessage: 'Loading...',
    description: 'Message when data is being loaded',
  },
  'library.course_import.page.parent_heading': {
    id: 'library.course_import.page.parent_heading',
    defaultMessage: 'Settings',
    description: 'Small text heading above the main title for the access page',
  },
  'library.course_import.page.heading': {
    id: 'library.course_import.page.heading',
    defaultMessage: 'Course import',
    description: 'Title of course import settings page',
  },
  'library.course_import.aside.course_list.title': {
    id: 'library.course_import.aside.course_list.title',
    defaultMessage: "Can't see your course?",
    description: 'Header for the aside description of importable course listing.',
  },
  'library.course_import.aside.course_list.text.first': {
    id: 'library.course_import.aside.course_list.text.first',
    defaultMessage: 'To import a course, you will need to be an admin of that course.',
    description: 'The first paragraph of detail text on course imports.',
  },
  'library.course_import.aside.course_list.text.second': {
    id: 'library.course_import.aside.course_list.text.second',
    defaultMessage: 'If you do not see your course here, contact the course owners and ask them for access.',
    description: 'The second paragraph of detail text on course imports.',
  },
  'library.course_import.aside.import_task_list.title': {
    id: 'library.course_import.aside.import_task_list.title',
    defaultMessage: "Can't see previous imports?",
    description: 'Header for the aside description of the course import page.',
  },
  'library.course_import.aside.import_task_list.text.first': {
    id: 'library.course_import.aside.import_task_list.text.first',
    defaultMessage: 'Previous imports will show if at least one import is scheduled.',
    description: 'The first paragraph of detail text on course import tasks.',
  },
  'library.course_import.aside.import_task_list.text.second': {
    id: 'library.course_import.aside.import_task_list.text.second',
    defaultMessage: 'To schedule a new import, click on "Show importable courses" and select the desired course to import the blocks from.',
    description: 'The second paragraph of detail text on course import tasks.',
  },
  'library.course_import.course_filter.title': {
    id: 'library.course_import.course_filter.title',
    defaultMessage: 'Find a course',
    description: 'The course filter title shown on the course import page',
  },
  'library.course_import.course_filter.input.default': {
    id: 'library.course_import.course_filter.input.default',
    defaultMessage: 'Enter ID, title, or organization.',
    description: 'The course filter input placeholder shown on the course import page',
  },
  'library.course_import.course_filter.options.org.label': {
    id: 'library.course_import.course_filter.options.org.label',
    defaultMessage: 'Organization',
    description: 'Label for the organization form group on the course import page.',
  },
  'library.course_import.course_filter.options.org.all': {
    id: 'library.course_import.course_filter.options.org.all',
    defaultMessage: 'All',
    description: 'Label for the empty organization option on the course import page.',
  },
  'library.course_import.course_filter.options.org.organizations': {
    id: 'library.course_import.course_filter.options.org.organizations',
    defaultMessage: 'Organizations',
    description: 'Label for the main organization option group on the course import page.',
  },
  'library.course_import.new_import.label': {
    id: 'library.course_import.new_import.label',
    defaultMessage: 'Import course',
    description: 'The text shown on the button used for importing courses.',
  },
  'library.course_import.ongoing_import.label': {
    id: 'library.course_import.ongoing_import.label',
    defaultMessage: 'Scheduling...',
    description: 'The text shown on the button used for indicating scheduling an import.',
  },
  'library.course_import.import_scheduled.label': {
    id: 'library.course_import.import_scheduled.label',
    defaultMessage: 'Import scheduled',
    description: 'The text shown on the button used for indicating that in import is scheduled.',
  },
  'library.course_import.import_schedule_failed.label': {
    id: 'library.course_import.import_schedule_failed.label',
    defaultMessage: 'Retry course import',
    description: 'The text shown on the button used for indicating that import scheduling failed.',
  },
  'library.course_import.importable_courses.show': {
    id: 'library.course_import.importable_courses.show',
    defaultMessage: 'Show importable courses',
    description: 'The text shown on the button used for showing the importable courses list.',
  },
  'library.course_import.importable_courses.hide': {
    id: 'library.course_import.importable_courses.hide',
    defaultMessage: 'Hide importable courses',
    description: 'The text shown on the button used for hiding the importable courses list.',
  },
  'library.course_import.importable_courses.no_item': {
    id: 'library.course_import.importable_courses.no_item',
    defaultMessage: 'No courses are available.',
    description: 'List item shown when no course list items are available.',
  },
  'library.course_import.import_tasks.no_item': {
    id: 'library.course_import.import_tasks.no_item',
    defaultMessage: 'No import tasks are available.',
    description: 'List item shown when no import task list items are available.',
  },
  'library.course_import.list_item.id': {
    id: 'library.course_import.list_item.id',
    defaultMessage: 'Course ID:',
    description: 'Label of the course ID metadata item',
  },
  'library.course_import.list_item.organization': {
    id: 'library.course_import.list_item.organization',
    defaultMessage: 'Organization:',
    description: 'Label of the course organization metadata item',
  },
  'library.library.course_import.list_item.state': {
    id: 'library.library.course_import.list_item.state',
    defaultMessage: 'State:',
    description: 'Label of the import task state metadata item',
  },
  'library.course_import.list_item.created_at': {
    id: 'library.course_import.list_item.created_at',
    defaultMessage: 'Created at:',
    description: 'Label of the import task creation metadata item',
  },
  'library.course_import.list_item.title': {
    id: 'library.course_import.list_item.title',
    defaultMessage: 'Import of {courseId}',
    description: 'Title of the import task item',
  },
});

export default messageGuard(messages);
