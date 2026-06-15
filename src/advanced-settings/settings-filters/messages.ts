import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  searchPlaceholder: {
    id: 'course-authoring.advanced-settings.settings-filters.search.placeholder',
    defaultMessage: 'Search settings...',
    description: 'Placeholder text shown inside the search input on the Advanced Settings filter bar',
  },
  searchLabel: {
    id: 'course-authoring.advanced-settings.settings-filters.search.label',
    defaultMessage: 'Search advanced settings',
    description: 'Screen-reader label for the search input on the Advanced Settings filter bar',
  },
  searchSubmitButton: {
    id: 'course-authoring.advanced-settings.settings-filters.search.submit',
    defaultMessage: 'Search',
    description: 'Screen-reader label for the search submit button on the Advanced Settings filter bar',
  },
  collapseAll: {
    id: 'course-authoring.advanced-settings.settings-filters.collapse-all',
    defaultMessage: 'Collapse all',
    description: 'Label for the button that collapses all setting sections on the Advanced Settings page',
  },
  expandAll: {
    id: 'course-authoring.advanced-settings.settings-filters.expand-all',
    defaultMessage: 'Expand all',
    description: 'Label for the button that expands all setting sections on the Advanced Settings page',
  },
  hideDeprecated: {
    id: 'course-authoring.advanced-settings.settings-filters.hide-deprecated',
    defaultMessage: 'Hide deprecated',
    description: 'Label for the button that hides deprecated settings on the Advanced Settings page',
  },
  showDeprecated: {
    id: 'course-authoring.advanced-settings.settings-filters.show-deprecated',
    defaultMessage: 'Show deprecated',
    description: 'Label for the button that shows deprecated settings on the Advanced Settings page',
  },
});

export default messages;
