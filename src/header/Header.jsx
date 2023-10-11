import React from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { StudioHeader } from '@edx/frontend-component-header';
import { getContentMenuItems, getSettingMenuItems, getToolsMenuItems } from './utils';
import messages from './messages';

const Header = ({
  courseId,
  courseOrg,
  courseNumber,
  courseTitle,
  isHiddenMainMenu,
  // injected
  intl,
}) => {
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
    <div className="site-header-desktop">
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
    </div>
  );
};

Header.propTypes = {
  courseId: PropTypes.string,
  courseNumber: PropTypes.string,
  courseOrg: PropTypes.string,
  courseTitle: PropTypes.string,
  isHiddenMainMenu: PropTypes.bool,
  // injected
  intl: intlShape.isRequired,
};

Header.defaultProps = {
  courseId: '',
  courseNumber: '',
  courseOrg: '',
  courseTitle: '',
  isHiddenMainMenu: false,
};

export default injectIntl(Header);
