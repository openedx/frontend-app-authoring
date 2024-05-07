// @ts-check
import React from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { StudioHeader } from '@edx/frontend-component-header';
import { useToggle } from '@openedx/paragon';

import { useTaggingFeaturesEnabled } from '../generic/data/apiHooks';
import SearchModal from '../search-modal/SearchModal';
import { getContentMenuItems, getSettingMenuItems, getToolsMenuItems } from './utils';
import messages from './messages';

const Header = ({
  courseId,
  courseOrg,
  courseNumber,
  courseTitle,
  isHiddenMainMenu,
}) => {
  const intl = useIntl();

  const [isShowSearchModalOpen, openSearchModal, closeSearchModal] = useToggle(false);
  const taxonomiesEnabled = useTaggingFeaturesEnabled();

  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
  const meiliSearchEnabled = [true, 'true'].includes(getConfig().MEILISEARCH_ENABLED);
  const mainMenuDropdowns = [
    {
      id: `${intl.formatMessage(messages['header.links.content'])}-dropdown-menu`,
      buttonTitle: intl.formatMessage(messages['header.links.content']),
      items: getContentMenuItems({ studioBaseUrl, courseId, intl }),
    },
    {
      id: `${intl.formatMessage(messages['header.links.settings'])}-dropdown-menu`,
      buttonTitle: intl.formatMessage(messages['header.links.settings']),
      items: getSettingMenuItems({ studioBaseUrl, courseId, intl }),
    },
    {
      id: `${intl.formatMessage(messages['header.links.tools'])}-dropdown-menu`,
      buttonTitle: intl.formatMessage(messages['header.links.tools']),
      items: getToolsMenuItems({
        studioBaseUrl, courseId, intl, taxonomiesEnabled,
      }),
    },
  ];
  const outlineLink = `${studioBaseUrl}/course/${courseId}`;

  return (
    <>
      <StudioHeader
        org={courseOrg}
        number={courseNumber}
        title={courseTitle}
        isHiddenMainMenu={isHiddenMainMenu}
        mainMenuDropdowns={mainMenuDropdowns}
        outlineLink={outlineLink}
        searchButtonAction={meiliSearchEnabled && openSearchModal}
      />
      { meiliSearchEnabled && (
        <SearchModal
          isOpen={isShowSearchModalOpen}
          courseId={courseId}
          onClose={closeSearchModal}
        />
      )}
    </>
  );
};

Header.propTypes = {
  courseId: PropTypes.string,
  courseNumber: PropTypes.string,
  courseOrg: PropTypes.string,
  courseTitle: PropTypes.string,
  isHiddenMainMenu: PropTypes.bool,
};

Header.defaultProps = {
  courseId: '',
  courseNumber: '',
  courseOrg: '',
  courseTitle: '',
  isHiddenMainMenu: false,
};

export default Header;
