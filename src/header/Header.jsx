// @ts-check
import React from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';

import { StudioHeader } from '@edx/frontend-component-header';
import { getContentMenuItems, getSettingMenuItems, getToolsMenuItems } from './utils';
import messages from './messages';
import SearchModal from '../search-modal/SearchModal';
import { useKeyHandler } from '../hooks';

const Header = ({
  courseId,
  courseOrg,
  courseNumber,
  courseTitle,
  isHiddenMainMenu,
}) => {
  const intl = useIntl();
  const [showSearchModal, setShowSearchModal] = React.useState(false);
  const toggleModal = React.useCallback(() => setShowSearchModal(x => !x), []);
  useKeyHandler({ handler: toggleModal, keyName: '/' });

  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
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
      items: getToolsMenuItems({ studioBaseUrl, courseId, intl }),
    },
  ];
  const outlineLink = `${studioBaseUrl}/course/${courseId}`;
  return (
    <>
      <StudioHeader
        {...{
          org: courseOrg,
          number: courseNumber,
          title: courseTitle,
          isHiddenMainMenu,
          mainMenuDropdowns,
          outlineLink,
        }}
      />
      <SearchModal
        isOpen={showSearchModal}
        courseId={courseId}
        onClose={toggleModal}
      />
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
