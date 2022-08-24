import { defineMessages } from '@edx/frontend-platform/i18n';
import { messageGuard } from './data';

const messages = defineMessages({
  'library.common.tabs.courses': {
    id: 'library.common.tabs.courses',
    defaultMessage: 'Courses',
    description: 'Text on the courses tab.',
  },
  'library.common.tabs.libraries': {
    id: 'library.common.tabs.libraries',
    defaultMessage: 'Libraries',
    description: 'Text on the libraries tab.',
  },
  'library.common.forms.button.cancel': {
    id: 'library.common.forms.button.cancel',
    defaultMessage: 'Cancel',
    description: 'Default label for "Cancel" buttons.',
  },
  'library.common.forms.button.ok': {
    id: 'library.common.forms.button.ok',
    defaultMessage: 'Ok',
    description: 'Default label for "Ok" buttons.',
  },
  'library.common.forms.button.submit': {
    id: 'library.common.forms.button.submit',
    defaultMessage: 'Submit',
    description: 'Default label for "Submit" buttons.',
  },
  'library.common.forms.button.create': {
    id: 'library.common.forms.button.create',
    defaultMessage: 'Create',
    description: 'Default label for "Create" buttons.',
  },
  'library.common.forms.button.submitting': {
    id: 'library.common.forms.button.submitting',
    defaultMessage: 'Submitting...',
    description: 'Default label for "Submit" buttons when currently submitting.',
  },
  'library.common.forms.button.creating': {
    id: 'library.common.forms.button.creating',
    defaultMessage: 'Creating...',
    description: 'Default label for "Create" buttons when currently submitting.',
  },
  'library.common.forms.button.yes': {
    id: 'library.common.forms.button.yes',
    defaultMessage: 'Yes.',
    description: 'Default label for "Yes" on a confirmation prompt.',
  },
  'library.server.error.generic': {
    id: 'library.server.error.generic',
    defaultMessage: 'We had an issue contacting the server. Please try again later!',
    description: 'Default error message when contacting server.',
  },
  'library.common.fields.license.label': {
    id: 'library.common.fields.license.label',
    defaultMessage: 'License Type',
    description: 'Label for license type field.',
  },
  'library.common.fields.license.cc.learn_more': {
    id: 'library.common.fields.license.learn_more',
    defaultMessage: 'Learn more about Creative Commons',
    description: 'Invitation to learn more about Creative Commons.',
  },
  'library.common.fields.license.cc.options': {
    id: 'library.common.fields.license.cc.options',
    defaultMessage: 'Options for Creative Commons',
    description: 'Header for the list of Creative Commons options.',
  },
  'library.common.fields.license.cc.attribution': {
    id: 'library.common.fields.license.attribution',
    defaultMessage: 'Allow others to copy, distribute, display and perform your copyrighted work but only if they '
      + 'give credit the way you request. Currently, this option is required.',
    description: 'Description of the \'attribution\' (BY) option for Creative Commons Licenses.',
  },
  'library.common.fields.license.cc.noncommercial': {
    id: 'library.common.fields.license.noncommercial',
    defaultMessage: 'Allow others to copy, distribute, display and perform your work - and derivative works based '
      + 'upon it - but for noncommercial purposes only.',
    description: 'Description of the \'noncommercial\' (NC) option for Creative Commons Licenses.',
  },
  'library.common.fields.license.cc.no_derivatives': {
    id: 'library.common.fields.license.no_derivatives',
    defaultMessage: 'Allow others to copy, distribute, display and perform only verbatim copies of your work, not '
      + 'derivative works based upon it. This option is incompatible with "Share Alike".',
    description: 'Description of the \'no derivatives\' (ND) option for Creative Commons Licenses.',
  },
  'library.common.fields.license.cc.share_alike': {
    id: 'library.common.fields.license.share_alike',
    defaultMessage: 'Allow others to distribute derivative works only under a license identical to the license that '
      + 'governs your work. This option is incompatible with "No Derivatives".',
    description: 'Description of the \'no derivatives\' (ND) option for Creative Commons Licenses.',
  },
  'library.common.license.cc': {
    id: 'library.common.license.cc',
    defaultMessage: 'Creative Commons',
    description: 'Label for Creative Commons license types.',
  },
  'library.common.license.cc.preface': {
    id: 'library.common.license.cc.preface',
    defaultMessage: 'Creative Commons licensed content, with terms as follows:',
    description: 'Preface message introducing the terms of the current Creative Commons license. Screen readers only.',
  },
  'library.common.license.cc.attribution': {
    id: 'library.common.license.cc.attribution',
    defaultMessage: 'Attribution',
    description: 'Label for the Creative Commons \'attribution\' (BY) modifier.',
  },
  'library.common.license.cc.noncommercial': {
    id: 'library.common.license.cc.noncommercial',
    defaultMessage: 'Noncommercial',
    description: 'Label for the Creative Commons \'noncommercial\' (NC) modifier.',
  },
  'library.common.license.cc.no_derivatives': {
    id: 'library.common.license.cc.no_derivatives',
    defaultMessage: 'No Derivatives',
    description: 'Label for the Creative Commons \'no derivatives\' (ND) modifier.',
  },
  'library.common.license.cc.share_alike': {
    id: 'library.common.license.cc.share_alike',
    defaultMessage: 'Share Alike',
    description: 'Label for the Creative Commons \'share alikes\' (SA) modifier.',
  },
  'library.common.license.cc.postscript': {
    id: 'library.common.license.cc.postscript',
    defaultMessage: 'Some Rights Reserved.',
    description: 'Postscript message after showing the attributes for a Creative Commons license.',
  },
  'library.common.license.none': {
    id: 'library.common.license.none',
    defaultMessage: 'All Rights Reserved',
    description: 'Text/Label for a license where all rights are reserved.',
  },
  'library.common.pagination.labels.previous': {
    id: 'library.common.pagination.labels.previous',
    defaultMessage: 'Previous',
    description: 'Label of the pagination item for previous button',
  },
  'library.common.pagination.labels.next': {
    id: 'library.common.pagination.labels.next',
    defaultMessage: 'Next',
    description: 'Label of the pagination item for next button',
  },
  'library.common.pagination.labels.page': {
    id: 'library.common.pagination.labels.page',
    defaultMessage: 'Page',
    description: 'Label of the pagination item for page used for aria text',
  },
  'library.common.pagination.labels.currentPage': {
    id: 'library.common.pagination.labels.currentPage',
    defaultMessage: 'Current page',
    description: 'Label of the pagination item for the current page used for aria text',
  },
  'library.common.pagination.labels.pageOfCount': {
    id: 'library.common.pagination.labels.pageOfCount',
    defaultMessage: 'PageOfCount',
    description: 'Label of the pagination item for page of count used for aria text',
  },
  'library.common.footer.hyperlink.about': {
    id: 'library.common.footer.hyperlink.about',
    defaultMessage: 'Learn more about libraries',
    description: 'The link opens in a new tab that leads to the page on edx.org',
  },
  'library.common.breadcrumbs.studio': {
    id: 'library.common.breadcrumbs.studio',
    defaultMessage: 'Studio',
    description: 'Text for link to studio.',
  },
});

export default messageGuard(messages);
