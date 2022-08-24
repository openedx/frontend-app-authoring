import { defineMessages } from '@edx/frontend-platform/i18n';
import { messageGuard } from '../common/data';

const messages = defineMessages({
  'library.list.page.heading': {
    id: 'library.list.page.heading',
    defaultMessage: 'Libraries',
    description: 'The page heading for the library list page.',
  },
  'library.list.new.library': {
    id: 'library.list.new.library',
    defaultMessage: 'New Library',
    description: 'Text on the new library button.',
  },
  'library.list.loading.message': {
    id: 'library.list.loading.message',
    defaultMessage: 'Loading...',
    description: 'Message when data is being loaded',
  },
  'library.list.loading.error': {
    id: 'library.list.loading.error',
    defaultMessage: 'Error: {errorMessage}',
    description: 'Message when data failed to load',
  },
  'library.list.item.type': {
    id: 'library.list.item.type',
    defaultMessage: 'Type:',
    description: 'Label of the library type metadata item',
  },
  'library.list.item.type.video': {
    id: 'library.list.item.type.video',
    defaultMessage: 'Video (beta)',
    description: 'Label for the video library type.',
  },
  'library.list.item.type.problem': {
    id: 'library.list.item.type.problem',
    defaultMessage: 'Problem (beta)',
    description: 'Label for the problem library type.',
  },
  'library.list.item.type.complex': {
    id: 'library.list.item.type.complex',
    defaultMessage: 'Complex (beta)',
    description: 'Label for the complex library type.',
  },
  'library.list.item.type.legacy': {
    id: 'library.list.item.type.legacy',
    defaultMessage: 'Legacy',
    description: 'Label for the legacy library type.',
  },
  'library.list.item.organization': {
    id: 'library.list.organization',
    defaultMessage: 'Organization:',
    description: 'Label of the library organization metadata item',
  },
  'library.list.item.slug': {
    id: 'library.list.slug',
    defaultMessage: 'Library slug:',
    description: 'Label of the library slug metadata item',
  },
  'library.list.filter.title': {
    id: 'library.list.filter.title',
    defaultMessage: 'Find a library',
    description: 'Title text for the filter box.',
  },
  'library.list.filter.input.default': {
    id: 'library.list.filter.input.default',
    defaultMessage: 'Enter ID, title, or organization.',
    description: 'Default value for the filter input field.',
  },
  'library.list.filter.options.org.label': {
    id: 'library.list.filter.options.org.label',
    defaultMessage: 'Organization',
    description: 'Label for the organization form group.',
  },
  'library.list.filter.options.org.all': {
    id: 'library.list.filter.options.org.all',
    defaultMessage: 'All',
    description: 'Label for the empty organization option.',
  },
  'library.list.filter.options.org.organizations': {
    id: 'library.list.filter.options.org.organizations',
    defaultMessage: 'Organizations',
    description: 'Label for the main organization option group.',
  },
  'library.list.filter.options.type.label': {
    id: 'library.list.filter.options.type.label',
    defaultMessage: 'Type',
    description: 'Label for the type form group.',
  },
  'library.list.filter.options.type.types': {
    id: 'library.list.filter.options.type.types',
    defaultMessage: 'Types',
    description: 'Label for the main type option group.',
  },
  'library.list.filter.options.type.legacy': {
    id: 'library.list.filter.options.type.legacy',
    defaultMessage: 'Legacy',
    description: 'Label for the legacy type option.',
  },
  'library.list.filter.options.type.complex': {
    id: 'library.list.filter.options.type.complex',
    defaultMessage: 'Complex (beta)',
    description: 'Label for the complex type option.',
  },
  'library.list.filter.options.type.video': {
    id: 'library.list.filter.options.type.video',
    defaultMessage: 'Video (beta)',
    description: 'Label for the video type option.',
  },
  'library.list.filter.options.type.problem': {
    id: 'library.list.filter.options.type.problem',
    defaultMessage: 'Problem (beta)',
    description: 'Label for the video type option.',
  },
  'library.list.aside.title': {
    id: 'library.list.aside.title',
    defaultMessage: 'New to Studio?',
    description: 'Title text for the supplementary content.',
  },
  'library.list.aside.text': {
    id: 'library.list.aside.text',
    defaultMessage: `Click Help in the upper-right corner to get more
    information about the Studio page you are viewing. You can also use the
    links at the bottom of the page to access our continually updated
    documentation and other Studio resources.`,
    description: 'Text for the supplementary content.',
  },
  'library.list.aside.help.link': {
    id: 'library.list.aside.help.link',
    defaultMessage: 'Getting Started with Studio',
    description: 'Link text for the help link in the supplementary content.',
  },
  'library.list.breadcrumbs.libraries': {
    id: 'library.list.breadcrumbs.libraries',
    defaultMessage: 'Libraries',
    description: 'Label for the breadcrumbs parent link.',
  },
});

export default messageGuard(messages);
