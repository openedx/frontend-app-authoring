import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'library.list.page.heading': {
    id: 'library.list.page.heading',
    defaultMessage: 'Content Libraries',
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
  'library.list.item.type.complex': {
    id: 'library.list.item.type.complex',
    defaultMessage: 'Complex',
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
});

export default messages;
