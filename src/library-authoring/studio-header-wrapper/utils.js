import { LOADING_STATUS, ROUTES } from '../common';
import messages from './messages';

export const getOutlineLink = (loadingStatus, libraryId) => {
  if (loadingStatus === LOADING_STATUS.LOADED) {
    return `/library/${libraryId}`;
  }
  return '#';
};

export const getMainMenuDropdown = (loadingStatus, libraryId, intl) => {
  if (loadingStatus === LOADING_STATUS.LOADED && libraryId) {
    return ([
      {
        id: `${intl.formatMessage(messages['library.header.settings.menu'])}-dropdown-menu`,
        buttonTitle: intl.formatMessage(messages['library.header.settings.menu']),
        items: [
          {
            href: ROUTES.Detail.EDIT_SLUG(libraryId),
            title: intl.formatMessage(messages['library.header.settings.details']),
          },
          {
            href: ROUTES.Detail.ACCESS_SLUG(libraryId),
            title: intl.formatMessage(messages['library.header.settings.access']),
          },
          {
            href: ROUTES.Detail.IMPORT_SLUG(libraryId),
            title: intl.formatMessage(messages['library.header.settings.import']),
          },
        ],
      },
    ]);
  }
  return [];
};
