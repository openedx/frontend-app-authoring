import {
  Add as IconAdd,
  ArrowDropDown as ArrowDownIcon,
} from '@edx/paragon/icons';

import messages from './messages';

/**
 * Get header navigations settings for render
 * @param {object} headerNavigationsActions - List of header actions
 * @param {boolean} isSectionsExpanded - value for expand button
 * @param {boolean} isReIndexShow - value for render reindex button
 * @returns {Array<{
    *   tooltipText: string,
    *   buttonText: string,
    *   buttonVariant: string,
    *   icon: function,
    *   handler: function,
 * }>}
 */

const getHeaderNavigationsSettings = (
  headerNavigationsActions,
  isSectionsExpanded,
  isReIndexShow,
  intl,
) => {
  const {
    handleNewSection, handleReIndex, handleExpandAll, handleViewLive,
  } = headerNavigationsActions;

  const settings = [
    {
      tooltipText: intl.formatMessage(messages.newSectionButtonTooltip),
      buttonText: intl.formatMessage(messages.newSectionButton),
      buttonVariant: 'primary',
      icon: IconAdd,
      handler: handleNewSection,
    },
    {
      tooltipText: intl.formatMessage(messages.reindexButtonTooltip),
      buttonText: intl.formatMessage(messages.reindexButton),
      buttonVariant: 'outline-primary',
      handler: handleReIndex,
    },
    {
      buttonText: isSectionsExpanded
        ? intl.formatMessage(messages.collapseAllButton)
        : intl.formatMessage(messages.expandAllButton),
      buttonVariant: 'outline-primary',
      icon: ArrowDownIcon,
      handler: handleExpandAll,
    },
    {
      tooltipText: intl.formatMessage(messages.viewLiveButtonTooltip),
      buttonText: intl.formatMessage(messages.viewLiveButton),
      buttonVariant: 'outline-primary',
      handler: handleViewLive,
    },
  ];

  return !isReIndexShow ? settings.filter((_, index) => index !== 1) : settings;
};

// eslint-disable-next-line import/prefer-default-export
export { getHeaderNavigationsSettings };
