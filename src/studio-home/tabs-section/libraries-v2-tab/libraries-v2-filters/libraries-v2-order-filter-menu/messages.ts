import { defineMessages as _defineMessages } from '@edx/frontend-platform/i18n';
import type { defineMessages as defineMessagesType } from 'react-intl';

// frontend-platform currently doesn't provide types... do it ourselves.
const defineMessages = _defineMessages as typeof defineMessagesType;

const messages = defineMessages({
  librariesV2OrderFilterMenuAscendantLibrariesV2: {
    id: 'course-authoring.studio-home.libraries.tab.order-filter-menu.ascendant-librariesv2',
    defaultMessage: 'Name A-Z',
  },
  librariesV2OrderFilterMenuDescendantLibrariesV2: {
    id: 'course-authoring.studio-home.libraries.tab.order-filter-menu.descendant-librariesv2',
    defaultMessage: 'Name Z-A',
  },
  librariesV2OrderFilterMenuNewestLibrariesV2: {
    id: 'course-authoring.studio-home.libraries.tab.order-filter-menu.newest-librariesv2',
    defaultMessage: 'Newest',
  },
  librariesV2OrderFilterMenuOldestLibrariesV2: {
    id: 'course-authoring.studio-home.libraries.tab.order-filter-menu.oldest-librariesv2',
    defaultMessage: 'Oldest',
  },
});

export default messages;
