// @ts-check
import React from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { StudioHeader } from '@edx/frontend-component-header';
import { useToggle } from '@openedx/paragon';

import { SearchModal } from '../search-modal';
import { getContentMenuItems, getSettingMenuItems, getToolsMenuItems } from './utils';
import messages from './messages';

const Header = ({
  contentId,
  org,
  number,
  title,
  isHiddenMainMenu,
  isLibrary,
}) => {
  const intl = useIntl();

  const [isShowSearchModalOpen, openSearchModal, closeSearchModal] = useToggle(false);

  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
  const meiliSearchEnabled = [true, 'true'].includes(getConfig().MEILISEARCH_ENABLED);
  const mainMenuDropdowns = !isLibrary ? [
    {
      id: `${intl.formatMessage(messages['header.links.content'])}-dropdown-menu`,
      buttonTitle: intl.formatMessage(messages['header.links.content']),
      items: getContentMenuItems({ studioBaseUrl, courseId: contentId, intl }),
    },
    {
      id: `${intl.formatMessage(messages['header.links.settings'])}-dropdown-menu`,
      buttonTitle: intl.formatMessage(messages['header.links.settings']),
      items: getSettingMenuItems({ studioBaseUrl, courseId: contentId, intl }),
    },
    {
      id: `${intl.formatMessage(messages['header.links.tools'])}-dropdown-menu`,
      buttonTitle: intl.formatMessage(messages['header.links.tools']),
      items: getToolsMenuItems({ studioBaseUrl, courseId: contentId, intl }),
    },
  ] : [];
  const outlineLink = !isLibrary ? `${studioBaseUrl}/course/${contentId}` : `${studioBaseUrl}/library/${contentId}`;

  return (
    <>
      <StudioHeader
        org={org}
        number={number}
        title={title}
        isHiddenMainMenu={isHiddenMainMenu}
        mainMenuDropdowns={mainMenuDropdowns}
        outlineLink={outlineLink}
        searchButtonAction={meiliSearchEnabled ? openSearchModal : undefined}
      />
      { meiliSearchEnabled && (
        <SearchModal
          isOpen={isShowSearchModalOpen}
          courseId={isLibrary ? undefined : contentId}
          onClose={closeSearchModal}
        />
      )}
    </>
  );
};

Header.propTypes = {
  contentId: PropTypes.string,
  number: PropTypes.string,
  org: PropTypes.string,
  title: PropTypes.string,
  isHiddenMainMenu: PropTypes.bool,
  isLibrary: PropTypes.bool,
};

Header.defaultProps = {
  contentId: '',
  number: '',
  org: '',
  title: '',
  isHiddenMainMenu: false,
  isLibrary: false,
};

export default Header;
